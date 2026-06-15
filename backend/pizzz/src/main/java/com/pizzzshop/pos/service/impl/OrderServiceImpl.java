package com.pizzzshop.pos.service.impl;

import com.pizzzshop.pos.constant.*;
import com.pizzzshop.pos.dto.request.*;
import com.pizzzshop.pos.dto.response.OrderResponse;
import com.pizzzshop.pos.entity.*;
import com.pizzzshop.pos.repository.*;
import com.pizzzshop.pos.util.PriceCalculatorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderItemModifierRepository modifierRepository;
    private final ProductRepository productRepository;
    private final BranchRepository branchRepository;
    private final CustomerRepository customerRepository;
    private final CashShiftRepository cashShiftRepository;
    private final ToppingRepository toppingRepository;
    private final PriceCalculatorUtil priceCalculator;
    private final SimpMessagingTemplate messagingTemplate;
    private final InventoryServiceImpl inventoryService;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final PromotionServiceImpl promotionService;

    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {
        Branch branch = branchRepository.findById(request.getBranchId())
            .orElseThrow(() -> new RuntimeException("Branch not found"));

        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User cashier = userRepository.findByUsername(username).orElse(null);

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        }

        CashShift cashShift = null;
        if (request.getCashShiftId() != null) {
            cashShift = cashShiftRepository.findById(request.getCashShiftId()).orElse(null);
        }

        Order order = Order.builder()
            .branch(branch)
            .customer(customer)
            .cashier(cashier)
            .cashShift(cashShift)
            .orderType(request.getOrderType())
            .tableNumber(request.getTableNumber())
            .instructionNotes(request.getInstructionNotes())
            .status(OrderStatus.PREPARING)
            .paymentStatus(PaymentStatus.UNPAID)
            .build();

        // Calculate items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));

            BigDecimal unitPrice;
            if (Boolean.TRUE.equals(itemReq.getIsHalfAndHalf()) && itemReq.getProductIdHalf() != null) {
                unitPrice = priceCalculator.calculateHalfAndHalfPrice(
                    itemReq.getProductId(), itemReq.getProductIdHalf(),
                    itemReq.getSizeId(), itemReq.getCrustId());
            } else {
                unitPrice = priceCalculator.getBasePrice(
                    itemReq.getProductId(), itemReq.getSizeId(), itemReq.getCrustId());
            }

            // Add modifier prices
            BigDecimal modifierTotal = BigDecimal.ZERO;
            if (itemReq.getModifiers() != null) {
                for (ModifierRequest mod : itemReq.getModifiers()) {
                    if (mod.getModifierType() == ModifierType.ADD) {
                        modifierTotal = modifierTotal.add(
                            priceCalculator.getToppingPrice(mod.getToppingId(), itemReq.getSizeId()));
                    }
                }
            }

            BigDecimal itemTotal = unitPrice.add(modifierTotal)
                .multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            Size size = itemReq.getSizeId() != null
                ? new Size(itemReq.getSizeId(), null) : null;
            Crust crust = itemReq.getCrustId() != null
                ? new Crust(itemReq.getCrustId(), null) : null;
            Product productHalf = itemReq.getProductIdHalf() != null
                ? new Product() : null;
            if (productHalf != null) productHalf.setId(itemReq.getProductIdHalf());

            OrderItem orderItem = OrderItem.builder()
                .order(order)
                .product(product)
                .size(size)
                .crust(crust)
                .isHalfAndHalf(itemReq.getIsHalfAndHalf())
                .productHalf(productHalf)
                .quantity(itemReq.getQuantity())
                .unitPrice(unitPrice)
                .subtotal(itemTotal)
                .itemNotes(itemReq.getItemNotes())
                .build();

            items.add(orderItem);
            totalAmount = totalAmount.add(itemTotal);
        }

        Promotion promotion = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getPromoCode() != null && !request.getPromoCode().isBlank()) {
            Promotion candidate = promotionRepository.findByCodeAndIsActiveTrue(request.getPromoCode()).orElse(null);
            if (candidate != null && promotionService.checkValidity(candidate, totalAmount) == null) {
                promotion = candidate;
                discountAmount = promotionService.calculateDiscount(candidate, totalAmount, items);
            }
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);
        BigDecimal taxAmount = priceCalculator.calculateVat(finalAmount);

        order.setTotalAmount(totalAmount);
        order.setTaxAmount(taxAmount);
        order.setDiscountAmount(discountAmount);
        order.setFinalAmount(finalAmount);
        order.setPromotion(promotion);

        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : items) {
            item.setOrder(savedOrder);
        }
        orderItemRepository.saveAll(items);

        // Save modifiers
        List<OrderItemModifier> allModifiers = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            OrderItemRequest itemReq = request.getItems().get(i);
            OrderItem savedItem = items.get(i);
            if (itemReq.getModifiers() != null) {
                for (ModifierRequest mod : itemReq.getModifiers()) {
                    BigDecimal price = mod.getModifierType() == ModifierType.ADD
                        ? priceCalculator.getToppingPrice(mod.getToppingId(), itemReq.getSizeId())
                        : BigDecimal.ZERO;

                    Topping topping = new Topping();
                    topping.setId(mod.getToppingId());

                    allModifiers.add(OrderItemModifier.builder()
                        .orderItem(savedItem)
                        .topping(topping)
                        .modifierType(mod.getModifierType())
                        .price(price)
                        .build());
                }
            }
        }
        modifierRepository.saveAll(allModifiers);

        // Deduct inventory
        inventoryService.deductStockForOrder(savedOrder.getBranch().getId(), items);

        List<OrderItem> savedItems = orderItemRepository.findByOrderId(savedOrder.getId());
        OrderResponse response = toResponse(savedOrder, savedItems);

        // Push to KDS via WebSocket
        messagingTemplate.convertAndSend("/topic/kds/" + branch.getId(), response);

        return response;
    }

    public List<OrderResponse> getActiveOrders(Long branchId) {
        List<Order> orders = orderRepository.findByBranchIdAndStatusInOrderByCreatedAtAsc(
            branchId,
            List.of(OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.BAKING, OrderStatus.READY)
        );
        return orders.stream().map(o -> toResponse(o, o.getItems())).toList();
    }

    public List<OrderResponse> getHeldOrders(Long branchId) {
        return orderRepository.findByBranchIdAndIsHeldTrue(branchId)
            .stream().map(o -> toResponse(o, o.getItems())).toList();
    }

    public List<OrderResponse> getOrderHistory(Long branchId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();
        return orderRepository.findByBranchIdAndCreatedAtBetweenOrderByCreatedAtDesc(branchId, start, end)
            .stream().map(o -> toResponse(o, o.getItems())).toList();
    }

    public OrderResponse getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        return toResponse(order, orderItemRepository.findByOrderId(orderId));
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        OrderResponse response = toResponse(order, items);

        // Push update to KDS
        messagingTemplate.convertAndSend("/topic/kds/" + order.getBranch().getId(), response);
        return response;
    }

    @Transactional
    public OrderResponse holdOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setIsHeld(true);
        orderRepository.save(order);
        return toResponse(order, orderItemRepository.findByOrderId(orderId));
    }

    @Transactional
    public OrderResponse recallOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setIsHeld(false);
        orderRepository.save(order);
        return toResponse(order, orderItemRepository.findByOrderId(orderId));
    }

    @Transactional
    public OrderResponse voidOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(OrderStatus.VOIDED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return toResponse(order, items);
    }

    @Transactional
    public OrderResponse payOrder(Long orderId, PaymentMethod paymentMethod) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return toResponse(order, items);
    }

    private OrderResponse toResponse(Order order, List<OrderItem> items) {
        List<OrderResponse.OrderItemResponse> itemResponses = items.stream().map(item -> {
            List<OrderResponse.ModifierResponse> modifierResponses = modifierRepository.findByOrderItemId(item.getId())
                .stream().map(m ->
                    OrderResponse.ModifierResponse.builder()
                        .toppingId(m.getTopping() != null ? m.getTopping().getId() : null)
                        .toppingName(m.getTopping() != null ? m.getTopping().getName() : null)
                        .modifierType(m.getModifierType())
                        .price(m.getPrice())
                        .build()
                ).toList();

            return OrderResponse.OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .sizeName(item.getSize() != null ? item.getSize().getName() : null)
                .crustName(item.getCrust() != null ? item.getCrust().getName() : null)
                .isHalfAndHalf(item.getIsHalfAndHalf())
                .productHalfName(item.getProductHalf() != null ? item.getProductHalf().getName() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .itemNotes(item.getItemNotes())
                .modifiers(modifierResponses)
                .build();
        }).toList();

        return OrderResponse.builder()
            .id(order.getId())
            .branchId(order.getBranch() != null ? order.getBranch().getId() : null)
            .branchName(order.getBranch() != null ? order.getBranch().getName() : null)
            .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
            .customerName(order.getCustomer() != null ? order.getCustomer().getName() : null)
            .cashierName(order.getCashier() != null ?
                order.getCashier().getFirstName() + " " + order.getCashier().getLastName() : null)
            .orderType(order.getOrderType())
            .status(order.getStatus())
            .paymentMethod(order.getPaymentMethod())
            .paymentStatus(order.getPaymentStatus())
            .totalAmount(order.getTotalAmount())
            .taxAmount(order.getTaxAmount())
            .discountAmount(order.getDiscountAmount())
            .finalAmount(order.getFinalAmount())
            .promoCode(order.getPromotion() != null ? order.getPromotion().getCode() : null)
            .promoName(order.getPromotion() != null ? order.getPromotion().getName() : null)
            .tableNumber(order.getTableNumber())
            .instructionNotes(order.getInstructionNotes())
            .isHeld(order.getIsHeld())
            .items(itemResponses)
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .build();
    }
}
