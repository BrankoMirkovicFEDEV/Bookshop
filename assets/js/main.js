const URL = "https://my-json-server.typicode.com/mnemanjaCode/prodavnica/";

getData("pisci", ispisiPisce);

document.querySelector("#rang").addEventListener("change", filterChange);

let elStanje = document.querySelectorAll(".stanje");
elStanje.forEach((elem) => elem.addEventListener("change", filterChange));
document.querySelector("#pretraga").addEventListener("keyup", filterChange);
document.querySelector("#sort").addEventListener("change", filterChange);

document.getElementById("reset").addEventListener("click", ponistiFiltere);

let itemsPerPage = 3;
// localStorage.getItem("perPage", JSON.parse({}))
let pageIndex = 0;

function ponistiFiltere() {
  let checkedPisci = document.querySelectorAll(".pisac");
  checkedPisci.forEach((elem) => {
    elem.checked = false;
  });
  let checkedZanr = document.querySelectorAll(".zanr");
  checkedZanr.forEach((elem) => {
    elem.checked = false;
  });
  document.getElementById("rang").value = 1000;
  document.getElementById("pretraga").value = "";
  // console.log(document.getElementById("sort").selectedIndex);
  document.querySelectorAll("#sort")[0].selectedIndex = 0;

  // console.log(document.getElementById("btnNaStanju").checked)
  document.getElementById("btnNaStanju").checked = true;
  getData("knjige", ispisiKnjige);
}

function getData(endpoint, callback) {
  fetch(URL + endpoint)
    .then((response) => response.json())
    .then((data) => callback(data));
}

function ispisiPisce(data) {
  // console.log(data);
  localStorage.setItem("pisci", JSON.stringify(data));
  let pisciElement = document.querySelector("#pisci");
  let ispis = "";
  data.forEach((element) => {
    ispis += `
        <li class="list-group-item">
          <input type="checkbox" value="${element.id}" class="pisac" name="pisci"/>
                   ${element.ime} ${element.prezime}
                   <span id="pisac${element.id}" class="pisacSpan"></span>
         </li>
        `;
  });
  pisciElement.innerHTML = ispis;
  let checkPisci = document.querySelectorAll(".pisac");
  checkPisci.forEach((elem) => elem.addEventListener("change", filterChange));
  getData("zanrovi", ispisiZanrove);
}

function ispisiZanrove(data) {
  // console.log(data);
  localStorage.setItem("zanrovi", JSON.stringify(data));
  let zanroviElement = document.querySelector("#zanrovi");
  let ispis = "";
  data.forEach((element) => {
    ispis += `
      <li class="list-group-item">
        <input type="checkbox" value="${element.id}" class="zanr" name="zanrovi"/>
                 ${element.naziv}
       </li>
      `;
  });
  zanroviElement.innerHTML = ispis;
  let checkZanrove = document.querySelectorAll(".zanr");
  checkZanrove.forEach((elem) => elem.addEventListener("change", filterChange));
  getData("knjige", ispisiKnjige);
}

function filterChange() {
  getData("knjige", ispisiKnjige);
}
function ispisiKnjige(data) {
  data = filterPisaca(data);
  data = filterZanrova(data);
  data = filterCena(data);
  data = filterStanja(data);
  data = filterPretrage(data);
  data = filterSort(data);

  setItemPerPage();

  countPoPiscu(data);
  // console.log(data);
  let html = "";
  for (
    let i = pageIndex * itemsPerPage;
    i < pageIndex * itemsPerPage + itemsPerPage;
    i++
  ) {
    if (!data[i]) {
      break;
    }
    html += `
        <div class='col-lg-4 col-md-6 md-4'>
        <div class='card h-100'>
        <img src='assets/img/${data[i].slika.src}' alt='${data[i].slika.alt}'
        class='card-img-top'>
        <div class='card-body'>
        <h3 class='card-title'>${data[i].naslov}</h3>
        <p class='card-text'>${getPisci(data[i].pisacID)}</p>
        <p class='card-text'>${getZanrovi(data[i].zanrovi)}</p>
        <p class='card-text ${
          data[i].naStanju ? "text-success" : "text-danger"
        }'>
        ${data[i].naStanju ? "Knjga je dostupna" : "Knjiga je nedostupna"}
        </p>
        <p class='card-text text-decoration-line-through text-secondary'>
        <s>${data[i].price.staraCena}</s>
        </p>
        <p class='card-text text-primary'>${data[i].price.novaCena}</p>
        <div class='text-center'>
        <button class='btn btn-primary korpaB' data-id="${
          data[i].id
        }" data-naslov="${data[i].naslov}"
        data-cena="${data[i].price.novaCena}">Dodaj u korpu</button>
        </div> </div> </div> </div>
        `;
  }
  document.querySelector("#knjige").innerHTML = html;

  document.querySelectorAll(".korpaB").forEach((elem) => {
    elem.addEventListener("click", addToCart);
  });

  loadPageNumber(data);
  checkCart();
  pronadjiNajvecuCenu(data);
}

function addToCart() {
  console.log(this.dataset);
  let naslov = this.dataset.naslov;
  let id = this.dataset.id;
  let cena = this.dataset.cena;
  let cart = [];
  const cookieCars = document.cookie
    .split("; ")
    .find((row) => row.startsWith("chart333="));
  if (cookieCars) {
    cart = JSON.parse(cookieCars.split("=")[1]);
  }
  if (cart.some((elem) => elem.id == id)) {
    cart.find((elem) => elem.id == id).kolicina++;
  } else {
    cart.push({ id: id, naslov: naslov, kolicina: 1, cena: cena });
  }
  setCookie("chart333", JSON.stringify(cart), 5);
  checkCart();
}

function setCookie(name, value, expDat) {
  let datum = new Date();
  datum.setMonth(datum.getMonth() + expDat);
  document.cookie = name + "=" + value + "; expires=" + datum.toUTCString();
}

function countPoPiscu(data) {
  let spanPisaca = document.querySelectorAll(".pisacSpan");
  spanPisaca.forEach((elem) => {
    elem.textContent = "(0)";
  });
  console.log(data);
  let niz = data.map((elem) => elem.pisacID);
  console.log(niz);

  let counter = {};
  for (el of niz) {
    if (counter[el]) {
      counter[el] += 1;
    } else {
      counter[el] = 1;
    }
  }
  console.log(counter);
  for (let key in counter) {
    console.log(key);
    document.getElementById(`pisac${key}`).innerHTML = `(${counter[key]})`;
  }
}

function setItemPerPage() {
  let perLocalStorage = JSON.parse(localStorage.getItem("perPage"));
  console.log(perLocalStorage.per);
  if (perLocalStorage != null) {
    itemsPerPage = parseInt(perLocalStorage.per);
  }
}

function pronadjiNajvecuCenu(data) {
  // console.log(data)
  let najveca = data[0].price.novaCena;
  data.forEach((elem) => {
    if (parseInt(elem.price.novaCena) > parseInt(najveca)) {
      najveca = parseInt(elem.price.novaCena);
    }
  });
  // console.log(najveca)
  document.querySelector("#rez").textContent = najveca + " RSD";
}

function loadPageNumber(data) {
  let ispis = document.querySelector("#pageNum");
  ispis.innerHTML = "";

  let selectDrop = document.createElement("p");
  let ispisDrop = `<select>`;
  for (let i = 1; i < data.length; i++) {
    if (itemsPerPage == i) {
      ispisDrop += `<option selected value = "${i}">${i}</option>`;
    } else ispisDrop += `<option value = "${i}">${i}</option>`;
  }
  ispisDrop += `</select>`;
  selectDrop.innerHTML = ispisDrop;

  ispis.appendChild(selectDrop);
  selectDrop.querySelector("select").addEventListener("change", function (e) {
    itemsPerPage = parseInt(e.target.value);
    pageIndex = 0;
    localStorage.setItem("perPage", JSON.stringify({ per: e.target.value }));
    getData("knjige", ispisiKnjige);
  });

  let paraff1 = document.createElement("p");
  paraff1.innerHTML = "First";
  ispis.appendChild(paraff1);
  paraff1.addEventListener("click", function (e) {
    pageIndex = 0;
    getData("knjige", ispisiKnjige);
  });
  for (let i = 0; i < Math.ceil(data.length / itemsPerPage); i++) {
    let paraf = document.createElement("p");
    paraf.innerHTML = i + 1;
    paraf.addEventListener("click", function (e) {
      pageIndex = parseInt(e.target.textContent) - 1;
      getData("knjige", ispisiKnjige);
    });
    if (i == pageIndex) {
      paraf.style.fontSize = "2rem";
    }
    ispis.appendChild(paraf);
  }
  let paraff2 = document.createElement("p");
  paraff2.innerHTML = "Last";
  ispis.appendChild(paraff2);
  paraff2.addEventListener("click", function (e) {
    pageIndex = Math.ceil(data.length / itemsPerPage) - 1;
    getData("knjige", ispisiKnjige);
  });
}

function getPisci(pisciId) {
  let pisci = JSON.parse(localStorage.getItem("pisci"));
  // console.log(pisci)
  let objekat = pisci.filter((elem) => elem.id == pisciId)[0];
  // console.log(objekat)
  return objekat.ime + " " + objekat.prezime;
}

function getZanrovi(nizZanrovaID) {
  //[3,5]
  let zanrovi = JSON.parse(localStorage.getItem("zanrovi"));

  let ispis = "";
  let zanrObj = zanrovi.filter((elem) => nizZanrovaID.includes(elem.id));

  for (let i = 0; i < zanrObj.length; i++) {
    ispis += zanrObj[i].naziv;
    if (zanrObj.length - 1 != i) {
      ispis += ", ";
    }
  }
  return ispis;
}

function filterPisaca(data) {
  let privremeniNiz = [];
  let checkPisci = document.querySelectorAll(".pisac");
  checkPisci.forEach((elem) => {
    if (elem.checked) {
      privremeniNiz.push(parseInt(elem.value));
    }
  });
  // console.log(privremeniNiz)
  if (privremeniNiz.length != 0) {
    return data.filter((elem) =>
      privremeniNiz.includes(parseInt(elem.pisacID))
    );
  } else return data;
}

function filterZanrova(data) {
  let privremeniNiz = [];
  let checkZanrovi = document.querySelectorAll(".zanr");
  checkZanrovi.forEach((elem) => {
    if (elem.checked) {
      privremeniNiz.push(parseInt(elem.value));
    }
  });
  // console.log(privremeniNiz) [3,5,1]
  if (privremeniNiz.length != 0) {
    return data.filter((elem) =>
      elem.zanrovi.some((el) => privremeniNiz.includes(el))
    );
  } else return data;
}

function filterCena(data) {
  let cena = document.querySelector("#rang").value;
  // console.log(cena)
  document.querySelector("#rez").textContent = cena + " RSD";

  return data.filter((elem) => parseInt(elem.price.novaCena) <= parseInt(cena));
}

function filterStanja(data) {
  let radio = document.querySelector(".stanje:checked");
  // console.log(radio);
  if (radio.value == "dostupno") {
    return data.filter((elem) => elem.naStanju);
  } else return data.filter((elem) => !elem.naStanju);
}

function filterPretrage(data) {
  let tekst = document.querySelector("#pretraga").value;
  if (tekst) {
    return data.filter(
      (elem) =>
        elem.naslov.toLowerCase().indexOf(tekst.trim().toLowerCase()) != -1
    );
  } else return data;
}

function filterSort(data) {
  let metod = document.querySelector("#sort").value;
  // console.log(metod);
  if (metod == "asc") {
    return data.sort((a, b) =>
      parseInt(a.price.novaCena) > parseInt(b.price.novaCena) ? 1 : -1
    );
  } else {
    return data.sort((a, b) =>
      parseInt(a.price.novaCena) < parseInt(b.price.novaCena) ? 1 : -1
    );
  }
}

function checkCart() {
  let korpa = document.getElementById("korpa");
  const cookieCars = document.cookie
    .split("; ")
    .find((row) => row.startsWith("chart333="));
  let ispis = "";
  korpa.innerHTML = ispis;
  let suma = 0;
  if (cookieCars) {
    ispis += `<ul class='list-group'>`;
    let cart = JSON.parse(cookieCars.split("=")[1]);
    cart.forEach((elem) => {
      let ukupnaCena = parseInt(elem.cena) * parseInt(elem.kolicina);
      suma = suma + ukupnaCena;
      ispis += `<li class='list-group-item'>
      ${elem.naslov} (${ukupnaCena})<input type='number' data-id= '${elem.id}' class='cart-inp' min='1' value='${elem.kolicina}'>
      <button class='btn btn-danger deleteBtn' data-id='${elem.id}'> X</button>
      </li>`;
    });
    ispis += `</ul> <div>Ukupno:${suma} RSD</div>
    <div><button class='btn btn-danger deleteAll'>RemoveAll</button></div>`;
    korpa.innerHTML = ispis;
    document.querySelectorAll(".deleteBtn").forEach((elem) => {
      elem.addEventListener("click", function () {
        brisiStavku(this);
      });
    });
    document.querySelector(".deleteAll").addEventListener("click", obrisiSve);
    document.querySelectorAll(".cart-inp").forEach((elem) => {
      elem.addEventListener("change", promeniKolicinu);
    });
  }
}

function brisiStavku(self) {
  let id = parseInt(self.dataset.id);
  console.log(id);
  const cookieCars = document.cookie
    .split("; ")
    .find((row) => row.startsWith("chart333="));
  if (cookieCars) {
    let cart = JSON.parse(cookieCars.split("=")[1]);
    console.log(cart);
    cart = cart.filter((elem) => parseInt(elem.id) != parseInt(id));
    console.log(cart);
    setCookie("chart333", JSON.stringify(cart), 5);
    checkCart();
  }
}

function obrisiSve() {
  document.cookie = `chart333=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  checkCart();
}

function promeniKolicinu() {
  let id = parseInt(this.dataset.id);
  const cookieCars = document.cookie
    .split("; ")
    .find((row) => row.startsWith("chart333="));
  if (cookieCars) {
    let cart = JSON.parse(cookieCars.split("=")[1]);
    cart.find((elem) => elem.id == id).kolicina = parseInt(this.value);
    setCookie("chart333", JSON.stringify(cart), 5);
    console.log(cart);
    checkCart();
  }
}
