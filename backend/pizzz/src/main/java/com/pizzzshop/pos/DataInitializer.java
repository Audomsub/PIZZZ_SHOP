package com.pizzzshop.pos;

import com.pizzzshop.pos.constant.PromoType;
import com.pizzzshop.pos.constant.RoleType;
import com.pizzzshop.pos.entity.*;
import com.pizzzshop.pos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final CategoryRepository categoryRepository;
    private final SizeRepository sizeRepository;
    private final CrustRepository crustRepository;
    private final ProductRepository productRepository;
    private final ProductPriceRepository productPriceRepository;
    private final IngredientRepository ingredientRepository;
    private final ToppingRepository toppingRepository;
    private final ToppingPriceRepository toppingPriceRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final PromotionRepository promotionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (roleRepository.count() > 0) {
            log.info("Data already initialized, skipping...");
            return;
        }

        log.info("Initializing seed data...");

        // Roles
        Role adminRole = roleRepository.save(Role.builder().name(RoleType.ADMIN).build());
        Role managerRole = roleRepository.save(Role.builder().name(RoleType.MANAGER).build());
        Role cashierRole = roleRepository.save(Role.builder().name(RoleType.CASHIER).build());
        Role kitchenRole = roleRepository.save(Role.builder().name(RoleType.KITCHEN).build());
        Role riderRole = roleRepository.save(Role.builder().name(RoleType.RIDER).build());

        // Branch
        Branch branch1 = branchRepository.save(Branch.builder()
            .name("PIZZZ สาขาสยาม")
            .address("สยามพารากอน ชั้น G กรุงเทพ")
            .phone("02-000-1111")
            .build());

        // Users
        userRepository.save(User.builder()
            .branch(branch1).role(adminRole)
            .username("admin")
            .passwordHash(passwordEncoder.encode("admin1234"))
            .firstName("Admin").lastName("PIZZZ")
            .build());

        userRepository.save(User.builder()
            .branch(branch1).role(managerRole)
            .username("manager1")
            .passwordHash(passwordEncoder.encode("manager1234"))
            .firstName("สมชาย").lastName("ใจดี")
            .build());

        userRepository.save(User.builder()
            .branch(branch1).role(cashierRole)
            .username("cashier1")
            .passwordHash(passwordEncoder.encode("cashier1234"))
            .firstName("สุดา").lastName("รักงาน")
            .build());

        userRepository.save(User.builder()
            .branch(branch1).role(kitchenRole)
            .username("kitchen1")
            .passwordHash(passwordEncoder.encode("kitchen1234"))
            .firstName("ครัว").lastName("ร้อนไฟ")
            .build());

        // Categories
        Category pizzaCat = categoryRepository.save(Category.builder().name("Pizza").build());
        Category appetCat = categoryRepository.save(Category.builder().name("Appetizer").build());
        Category drinkCat = categoryRepository.save(Category.builder().name("Drink").build());
        Category dessertCat = categoryRepository.save(Category.builder().name("Dessert").build());

        // Sizes
        Size sizeS = sizeRepository.save(Size.builder().name("S").build());
        Size sizeM = sizeRepository.save(Size.builder().name("M").build());
        Size sizeL = sizeRepository.save(Size.builder().name("L").build());

        // Crusts
        Crust classic = crustRepository.save(Crust.builder().name("Classic").build());
        Crust thinCrust = crustRepository.save(Crust.builder().name("Thin Crust").build());
        Crust cheeseCrust = crustRepository.save(Crust.builder().name("Cheese Crust").build());

        // Ingredients
        Ingredient flour = ingredientRepository.save(Ingredient.builder()
            .name("แป้งพิซซ่า").unit("g").isAllergen(true).allergyNote("กลูเตน (Gluten)").build());
        Ingredient mozzarella = ingredientRepository.save(Ingredient.builder()
            .name("มอสซาเรลล่าชีส").unit("g").isAllergen(true).allergyNote("นม (Dairy)").build());
        Ingredient tomatoSauce = ingredientRepository.save(Ingredient.builder()
            .name("ซอสมะเขือเทศ").unit("g").isAllergen(false).build());
        Ingredient pepperoni = ingredientRepository.save(Ingredient.builder()
            .name("เปปเปอโรนี").unit("g").isAllergen(false).build());
        Ingredient pineapple = ingredientRepository.save(Ingredient.builder()
            .name("สับปะรด").unit("g").isAllergen(false).build());
        Ingredient shrimp = ingredientRepository.save(Ingredient.builder()
            .name("กุ้ง").unit("g").isAllergen(true).allergyNote("อาหารทะเล (Seafood)").build());

        // Toppings
        Topping mozzaTopping = toppingRepository.save(Topping.builder().ingredient(mozzarella).name("มอสซาเรลล่าชีสเพิ่ม").build());
        Topping pepperoniTopping = toppingRepository.save(Topping.builder().ingredient(pepperoni).name("เปปเปอโรนีเพิ่ม").build());
        Topping pineappleTopping = toppingRepository.save(Topping.builder().ingredient(pineapple).name("สับปะรดเพิ่ม").build());
        Topping shrimpTopping = toppingRepository.save(Topping.builder().ingredient(shrimp).name("กุ้งเพิ่ม").build());

        // Topping prices per size
        List<Topping> allToppings = List.of(mozzaTopping, pepperoniTopping, pineappleTopping, shrimpTopping);
        BigDecimal[] prices = {new BigDecimal("20"), new BigDecimal("30"), new BigDecimal("40")};
        Size[] sizes = {sizeS, sizeM, sizeL};

        for (Topping t : allToppings) {
            for (int i = 0; i < sizes.length; i++) {
                toppingPriceRepository.save(ToppingPrice.builder()
                    .topping(t).size(sizes[i]).price(prices[i]).build());
            }
        }

        // Pizza Products
        Product hawaiian = productRepository.save(Product.builder()
            .category(pizzaCat).name("Hawaiian").isPizza(true)
            .description("พิซซ่าหน้าแฮมและสับปะรด รสชาติหวานอมเปรี้ยว")
            .imageUrl("/images/hawaiian.jpg").build());

        Product pepperoniPizza = productRepository.save(Product.builder()
            .category(pizzaCat).name("Pepperoni").isPizza(true)
            .description("พิซซ่าคลาสสิกหน้าเปปเปอโรนีเต็มถาด")
            .imageUrl("/images/pepperoni.jpg").build());

        Product margherita = productRepository.save(Product.builder()
            .category(pizzaCat).name("Margherita").isPizza(true)
            .description("พิซซ่าต้นตำรับอิตาเลียน มะเขือเทศสดและชีสแท้")
            .imageUrl("/images/margherita.jpg").build());

        Product seafoodPizza = productRepository.save(Product.builder()
            .category(pizzaCat).name("Seafood Delight").isPizza(true)
            .description("พิซซ่าหน้าอาหารทะเลรวม กุ้ง หมึก ปู")
            .imageUrl("/images/seafood.jpg").build());

        // Product prices: size x crust
        Crust[] crusts = {classic, thinCrust, cheeseCrust};
        BigDecimal[][] pizzaPrices = {
            // S, M, L
            {new BigDecimal("199"), new BigDecimal("299"), new BigDecimal("399")},  // Classic
            {new BigDecimal("179"), new BigDecimal("279"), new BigDecimal("379")},  // Thin
            {new BigDecimal("229"), new BigDecimal("339"), new BigDecimal("469")},  // Cheese
        };

        for (Product pizza : List.of(hawaiian, pepperoniPizza, margherita, seafoodPizza)) {
            for (int c = 0; c < crusts.length; c++) {
                for (int s = 0; s < sizes.length; s++) {
                    productPriceRepository.save(ProductPrice.builder()
                        .product(pizza).size(sizes[s]).crust(crusts[c])
                        .price(pizzaPrices[c][s]).build());
                }
            }
        }

        // Non-pizza items
        Product chickenWings = productRepository.save(Product.builder()
            .category(appetCat).name("Chicken Wings").isPizza(false)
            .description("ปีกไก่ทอดกรอบ 6 ชิ้น เสิร์ฟพร้อมซอสบาร์บีคิว")
            .imageUrl("/images/wings.jpg").build());
        productPriceRepository.save(ProductPrice.builder()
            .product(chickenWings).size(sizeS).crust(classic)
            .price(new BigDecimal("149")).build());

        Product cola = productRepository.save(Product.builder()
            .category(drinkCat).name("Coca-Cola").isPizza(false)
            .description("น้ำอัดลม ขนาด 325ml").imageUrl("/images/cola.jpg").build());
        productPriceRepository.save(ProductPrice.builder()
            .product(cola).size(sizeS).crust(classic)
            .price(new BigDecimal("35")).build());

        Product fries = productRepository.save(Product.builder()
            .category(appetCat).name("French Fries").isPizza(false)
            .description("เฟรนช์ฟรายส์กรอบ").imageUrl("/images/fries.jpg").build());
        productPriceRepository.save(ProductPrice.builder()
            .product(fries).size(sizeS).crust(classic)
            .price(new BigDecimal("89")).build());

        // Inventory stocks
        inventoryStockRepository.save(InventoryStock.builder()
            .branch(branch1).ingredient(flour).quantity(new BigDecimal("5000")).lowStockThreshold(new BigDecimal("500")).build());
        inventoryStockRepository.save(InventoryStock.builder()
            .branch(branch1).ingredient(mozzarella).quantity(new BigDecimal("3000")).lowStockThreshold(new BigDecimal("300")).build());
        inventoryStockRepository.save(InventoryStock.builder()
            .branch(branch1).ingredient(tomatoSauce).quantity(new BigDecimal("2000")).lowStockThreshold(new BigDecimal("200")).build());
        inventoryStockRepository.save(InventoryStock.builder()
            .branch(branch1).ingredient(pepperoni).quantity(new BigDecimal("1500")).lowStockThreshold(new BigDecimal("200")).build());
        inventoryStockRepository.save(InventoryStock.builder()
            .branch(branch1).ingredient(pineapple).quantity(new BigDecimal("1000")).lowStockThreshold(new BigDecimal("100")).build());
        inventoryStockRepository.save(InventoryStock.builder()
            .branch(branch1).ingredient(shrimp).quantity(new BigDecimal("800")).lowStockThreshold(new BigDecimal("150")).build());

        // Promotions
        promotionRepository.save(Promotion.builder()
            .name("ลด 10% สำหรับลูกค้าใหม่")
            .code("WELCOME10")
            .promoType(PromoType.PERCENTAGE)
            .discountValue(new BigDecimal("10"))
            .minOrderAmount(new BigDecimal("200"))
            .isActive(true)
            .build());

        promotionRepository.save(Promotion.builder()
            .name("ลดทันที 50 บาท")
            .code("SAVE50")
            .promoType(PromoType.FIXED_AMOUNT)
            .discountValue(new BigDecimal("50"))
            .minOrderAmount(new BigDecimal("300"))
            .isActive(true)
            .build());

        promotionRepository.save(Promotion.builder()
            .name("Happy Hour ลด 15%")
            .code("HAPPY15")
            .promoType(PromoType.HAPPY_HOUR)
            .discountValue(new BigDecimal("15"))
            .minOrderAmount(BigDecimal.ZERO)
            .happyHourStart(14)
            .happyHourEnd(17)
            .isActive(true)
            .build());

        promotionRepository.save(Promotion.builder()
            .name("ซื้อ 1 แถม 1")
            .code("BOGOPIZZA")
            .promoType(PromoType.BOGO)
            .discountValue(BigDecimal.ZERO)
            .minOrderAmount(BigDecimal.ZERO)
            .isActive(true)
            .build());

        log.info("✅ Seed data initialized successfully!");
        log.info("🔑 Login: admin/admin1234 | manager1/manager1234 | cashier1/cashier1234 | kitchen1/kitchen1234");
    }
}
