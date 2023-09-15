

async function getProducts() {
    try {
        const data = await fetch(
            "https://ecommercebackend.fundamentos-29.repl.co/");

        const res = await data.json();

        window.localStorage.setItem("products", JSON.stringify(res))

        return res;
    } catch (error) {
        console.log(error);
    }
}

function printProducts(db) {
    const productsHTML = document.querySelector(".products");
    let html = "";

    for (const {image, id, name, quantity, price, category} of db.products) {
        html += `
            <div class="product ${category}">
                <div class="product__img">    
                    <img src="${image}" alt="imagen ${image}">
                </div>
                <div class="product__info">    
                    <h3>
                    $${price}
                    ${
                        quantity 
                        ? `<i class='bx bx-plus' id="${id}"></i> <span class="stock"><b>Stock: ${quantity}</b></span>` 
                        : "<span class= 'soldOut'>Sold out</span>"
                    }
                    </h3>
                    <h4 class="abrir__modal" id="${id}">${name}</h4>
                </div>
            </div>
        `;
    }
    productsHTML.innerHTML= html;
    
}

function handleShowCart() {
    const iconCartHTML = document.querySelector(".bx-cart");
    const cartHTML = document.querySelector(".cart");
    const cerrar = document.querySelector(".bx-x")

    iconCartHTML.addEventListener("click", function(){
        cartHTML.classList.add("cart__show");
        cerrar.addEventListener("click", ()=> {
            cartHTML.classList.remove("cart__show")
        })

    });
}

function addToCartFromProducts(db) {
    const productsHTML = document.querySelector(".products");
    
    productsHTML.addEventListener("click", function(e){
        if (e.target.classList.contains("bx-plus")) {
            const id = Number(e.target.id);
            
            const productFind = db.products.find(
                (product) => product.id === id
            );
            
            if (db.cart[productFind.id]){
                if (productFind.quantity === db.cart[productFind.id].amount)
                    return Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'No tenemos más disponibles!',
                      });                   
                db.cart[productFind.id].amount++;
            } else {
                db.cart[productFind.id] = { ...productFind, amount: 1};
            }
            
            window.localStorage.setItem("cart", JSON.stringify(db.cart));
            printProductsCart(db);
            priceTotal(db);
            handlePrintAmount(db);
        }
    });
    
}

function printProductsCart(db) {
    const cartProducts = document.querySelector(".cart__products");

    let html = "";

    for (const product in db.cart) {
        const {quantity, price, name, image, id, amount} = db.cart[product];

        html += ` 
        <div class="cart__product">
            <div class="cart__product--img">
                <img src="${image}" alt = "image ${image}">
            </div>
            <div class="cart__product--body">
                <h4>${name} | $${price}</h4>
                <p>Stock: ${quantity}</p>

                <div class="cart__product--body-op" id="${id}">
                    <i class="bx bx-minus"></i>
                    <span>${amount}</span>
                    <i class="bx bx-plus"></i>
                    <i class="bx bx-trash"></i>
                </div>
            </div>
        </div>
        `;
    }

    cartProducts.innerHTML = html;

    priceTotal(db);

}

function handleProductsCart(db) {
    
    const cartProducts = document.querySelector(".cart__products")

    cartProducts.addEventListener("click", function(e){
        if (e.target.classList.contains("bx-plus")) {
            const id = Number(e.target.parentElement.id);

            const productFind = db.products.find(
                (product) => product.id === id
            );

            if (productFind.quantity === db.cart[productFind.id].amount) 
                return Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'No tenemos más disponibles!',
                  });                

            db.cart[id].amount++;        
        }
        if (e.target.classList.contains("bx-minus")) {
            const id = Number(e.target.parentElement.id);

            if (db.cart[id].amount === 1) {
                const response = confirm("Estas seguro de eliminar este producto?");
                if (!response) return;

                 // Swal.fire({
                //     title: 'Eliminar este producto del carrito?',
                //     showDenyButton: true,
                //     showCancelButton: true,
                //     confirmButtonText: 'Si',
                //     denyButtonText: `No`,
                //   }).then((result) => {
                //     if (result.isConfirmed) {
                //         delete db.cart[id];
                //       Swal.fire('Saved!', '', 'success')
                //     } else if (result.isDenied) {
                //       return;
                //     }
                //   })


                delete db.cart[id];
            } else {
                db.cart[id].amount--;
            }
        }
        if (e.target.classList.contains("bx-trash")) {
            const id = Number(e.target.parentElement.id); 
            const response = confirm("Estas seguro de eliminar este producto?");
            if (!response) return;
            delete db.cart[id];       
        }

        window.localStorage.setItem("cart", JSON.stringify(db.cart))
        printProductsCart(db);
        priceTotal(db);
        handlePrintAmount(db);
    });
}

function priceTotal(db) {
    const infoTotal = document.querySelector(".info__total");
    const infoAmount = document.querySelector(".info__amount");

    let totalProducts = 0;
    let amountProducts = 0;

    for (const product in db.cart) {
        const {amount, price} = db.cart[product];
        totalProducts += price * amount;
        amountProducts += amount;
    }

    infoAmount.textContent = amountProducts + " items";
    infoTotal.textContent = "$" + totalProducts + ".00";

    
}

function handleTotal(db) {
    const btnBuy = document.querySelector(".btn__buy");

    btnBuy.addEventListener("click", function() {
        if (!Object.values(db.cart).length) return Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Agrega un producto al carrito!'
          });

        const response = confirm("¿Estas seguro de realizar esta compra?");
        Swal.fire({
            icon: 'success',
            title: 'Genial',
            text: 'Muchas gracias por tu compra!',
          })
        if (!response) return;

        const currentProducts = [];

        for (const product of db.products) {
            const productCart = db.cart[product.id];
            if (product.id === productCart?.id) {
                currentProducts.push({
                    ...product,
                    quantity: product.quantity - productCart.amount,
                });
            } else {
                currentProducts.push(product);
            }
        }

        db.products = currentProducts;
        db.cart = {};

        window.localStorage.setItem("products", JSON.stringify(db.products));
        window.localStorage.setItem("cart", JSON.stringify(db.cart));

        priceTotal(db);
        printProductsCart(db);
        printProducts(db);
        handlePrintAmount(db);

    });

}

function handlePrintAmount(db) {
    const amountProducts = document.querySelector(".amountProducts");

    let amount = 0;

    for (const product in db.cart) {
        amount += db.cart[product].amount;
    }

    amountProducts.textContent = amount;
}

function mixiEfect() {
    mixitup(".products", {
        selectors: {
            target: '.product'
        },
        animation: {
            duration: 400
        }
    });
    const filters = document.querySelectorAll(".filtro");

    for (const filter of filters) {
        filter.addEventListener("click", (e) => {
            for (const filt of filters) {
                filt.classList.remove("filtro--activo");
            }

            e.currentTarget.classList.add("filtro--activo");
        });
    }
            
}

function precarga() {
    const precarga = document.querySelector(".precarga");

    setTimeout(() => {
        precarga.style.display = "none";
    }, 1000);
}

function modalPrint(db) {
       
    const modal = document.querySelector(".modal");
    const contentProducts = document.querySelector(".products");

    let html = "";

    contentProducts.addEventListener("click", (e) => {
        const ide = Number(e.target.id)
        if (e.target.classList.contains("abrir__modal")){
        
        for (const {image, name, price, category, description, quantity, id} of db.products) {
            if (ide === id) {
                html = ` <div class="product__modal">
                            <i class="close bx bxs-x-circle"></i>
                            <div class="modal--img">
                                <img src="${image}" alt="image ${image}"></img>
                            </div>
                            <h3 class="modal--name">
                                ${name} - <span>${category}</span>
                            </h3>
                            <p class="modal--p">
                                ${description}
                            </p>
                            <div class="modal--info">
                                <h3>$${price}.00
                                ${quantity ? `<i id="${id}" class="bx bx-plus"></i>`: ""}                    
                                </h3>
                                ${quantity ? `<span class="stock"><b>Stock: ${quantity}</b></span><i id="${id}"` : `<span class="soldOut">Sold Out</span>`}
                            </div>
                        </div>`
                    
            }      
            

        }
        modal.innerHTML = html;
        modal.classList.add("modal--show");

            const close = document.querySelector(".close");

            close.addEventListener("click", function() {
                modal.classList.remove("modal--show");
            })
        
        }
    });

}


function addToCartFromModal(db) {
    const addProduct = document.querySelector(".modal")

    addProduct.addEventListener("click", (e)=> {
        if(e.target.classList.contains("bx-plus")){
            const id = Number(e.target.id);
            const productFind = db.products.find(
                (product) => product.id === id
            );
            
            if (db.cart[productFind.id]){
                if (productFind.quantity === db.cart[productFind.id].amount)
                    return Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'No tenemos más disponibles!',
                      });                   
                db.cart[productFind.id].amount++;
            } else {
                db.cart[productFind.id] = { ...productFind, amount: 1};
            }
            
            window.localStorage.setItem("cart", JSON.stringify(db.cart));
            printProductsCart(db);
            priceTotal(db);
            handlePrintAmount(db);

        }
    })
    
}

function handleTheme(db) {
    const bodyHTML = document.querySelector("body");
    const iconTheme = document.querySelector("#theme");

    iconTheme.addEventListener("click", ()=> {
        iconTheme.classList.toggle("bx-sun");

        bodyHTML.classList.toggle("dark");
        if (bodyHTML.classList.contains("dark")) {
            localStorage.setItem('dark-mode', 'true');
        } else {
            localStorage.setItem('dark-mode', 'false');
        }

    });

    if (localStorage.getItem('dark-mode') === 'true') {
        bodyHTML.classList.add("dark");
        iconTheme.classList.remove("bx-sun");

    } else {
        bodyHTML.classList.remove("dark");
    }
    
}

function animationNav() {
    const header = document.querySelector("header")
    const navLink = document.querySelector(".home--link")
    const productLink = document.querySelector(".productos--link")

    window.addEventListener("scroll", function () {
        
       
        header.classList.toggle("nav__show", window.scrollY > 0)
        
        productLink.classList.toggle("linkk", window.scrollY > 520)

        navLink.classList.toggle("linkk", window.scrollY < 580)
    });
}

function handleShowMenu() {
    const hamburguerHTML = document.querySelector(".hamburguer");
    const menuHTML = document.querySelector(".menu__nav");
    const casaHTML = document.querySelector(".casa");
    const productsHTML = document.querySelector(".content_products");

    function menuToggles() {
        hamburguerHTML.classList.toggle("bx-menu")
        hamburguerHTML.classList.toggle("bx-x")
    }

    hamburguerHTML.addEventListener("click", function () {
        menuHTML.classList.toggle("menu__show")

        if (hamburguerHTML.classList.contains("hamburguer")) {
            menuToggles();
        }
    });

    productsHTML.addEventListener("click", function () {
        productsHTML.classList.add("linkk")
        casaHTML.classList.remove("linkk")
        menuHTML.classList.toggle("menu__show")
        hamburguerHTML.classList.toggle("bx-menu")
        hamburguerHTML.classList.remove("bx-x")

    });

    casaHTML.addEventListener("click", function () {
        productsHTML.classList.remove("linkk")
        casaHTML.classList.add("linkk")
        menuHTML.classList.toggle("menu__show")
        hamburguerHTML.classList.toggle("bx-menu")
        hamburguerHTML.classList.remove("bx-x")
    });

    
}







async function main() {
    const db = {
        products: 
            JSON.parse(window.localStorage.getItem("products")) || 
            (await getProducts()),

        cart: JSON.parse(window.localStorage.getItem('cart')) || {},
    } 

    printProducts(db);

    handleShowCart();

    addToCartFromProducts(db);

    printProductsCart(db);

    handleProductsCart(db);

    priceTotal(db);

    handleTotal(db);
    
    handlePrintAmount(db);

    mixiEfect();

    precarga();
    
    modalPrint(db);

    addToCartFromModal(db);

    handleTheme(db);

    animationNav();

    handleShowMenu();
   


}

main();