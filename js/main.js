let burgerBtn = document.querySelector(".burger-menu-btn");
let burgerMenu = document.querySelector(".burger-menu");

let isBurgerOpen = false;

burgerBtn.onclick = function () {
	if (!isBurgerOpen) {
		burgerMenu.style.display = "block";
		burgerBtn.style.backgroundPosition = "center left 50px, center";
		isBurgerOpen = true;
	}

	else if (isBurgerOpen) {
		burgerMenu.style.display = "none";
		burgerBtn.style.backgroundPosition = "center, center left 50px";
		isBurgerOpen = false;
	}

}

/* async function loadProducts() {
  const res = await fetch("http://localhost:5000/api/products");
  const products = await res.json();

  const container = document.getElementById("products");
  container.innerHTML = "";

  products.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image}" />
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <span>$${p.price}</span>
      </div>
    `;
  });
}

loadProducts();*/
