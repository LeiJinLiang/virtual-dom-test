const items = [
    { name: 'iPhone X', price: 8688.00 },
    { name: 'GoPro Hero5 Black', price: 2988.00 },
    { name: 'Nintendo Switch', price: 1988.00 },
    { name: 'Panasonic NA98C', price: 1299.00 },
];

var tpl = document.querySelector('#template').innerHTML;
var result = document.querySelector('.result');
result.innerHTML =template(tpl, items);