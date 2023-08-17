const canvas = document.getElementById('games');
const ctx = canvas.getContext('2d');


// Встановлюємо розмір canvas на весь екран
// canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Перевірка, чи це мобільний пристрій
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Оголосити змінну touchY
let mobileDevice = isMobileDevice();

const levelsGame = [
  // Рівень 1
  {
    theme: 'theme-1',
    sound: '',
    key: 4,
  },
  // Рівень 2
  {
    theme: 'theme-2',
    sound: '',
    key: 6,
  },
  // Рівень 3
  {
    theme: 'theme-3',
    sound: '-beach',
    key: 8,
  },
  // Рівень 4
  {
    theme: 'theme-4',
    sound: '-beach',
    key: 10,
  },
  // Рівень 5
  {
    theme: 'theme-5',
    sound: '-city',
    key: 20,
  }
];

let butterflyY = canvas.height / 2; // Початкове положення метелика по вертикалі
let renderGame = false;
let endGame = false;
let distance = 0;
let keys = 0;
let pause = false;
let distanceKeys = 2500; // Відстань до ключа
let collisionSound, lifeSound, backgroundMusic, backgroundImage, butterflyImage, garbage, lifeImage, enemyInterval, backgroundImage_2, car;
let newLevel = 0;
let lives = 6; // Кількість життів '6'
let distanceLife = 1000; // Дестанція для життя '1000'
let bgX = 0; // Початкова позиція фону
let speedGame = 1; // Швидкість ігри '1'
let enemyTime = 600; // Час до появи ворога '600'
let level = 1; // Рівень

// Малюємо авто
class cars {
  constructor() {
    this.cars = [
      [191, 63],
      [86, 33],
      [92, 42],
      [84, 38],
      [81, 40],
      [88, 40],
      [88, 43],
      [81, 40],
    ];
    this.x = 0;
    this.y = 0;
    this.r = 0;
    this.model = Math.floor(Math.random() * 7);
  }
  draw() {
    ctx.save();
    ctx.translate(this.x+this.cars[this.model][0]/2, this.y-this.cars[this.model][1]/2);
    ctx.rotate(this.r * Math.PI / 180);
    ctx.drawImage(car[this.model], -this.cars[this.model][0]/2, -this.cars[this.model][1]/2, this.cars[this.model][0], this.cars[this.model][1]); 
    ctx.restore();
  }
}

// Для 2 рівня
let arrayСarsleft = [];
let arrayСarsRight = [];
let distanceСarsleft = 0;
let distanceСarsRight = 0;
const roadleft = [5,70];
const roadRight = [-170,-120];
// Створюємо авто на дорозі для 5 рівня
function addСars_2() {

  if (distanceСarsleft == 0) {
    let car = new cars();
    car.r = 90;
    car.y=+canvas.height;
    car.distance = roadleft[Math.round(Math.random())];
    arrayСarsleft.push(car);
    distanceСarsleft=2000;
  }
  if (distanceСarsRight == 0) {
    let car = new cars();
    car.r = 270;
    car.y = -200;
    car.distance = roadRight[Math.round(Math.random())];
    arrayСarsRight.push(car);
    distanceСarsRight=1700;
  }
  distanceСarsleft--;
  distanceСarsRight--;
}
// Унікальні рівні
function level_2() {
  addСars_2();
  // Ставимо машину на свою полосу
  for (let i = 0; i < arrayСarsleft.length; i++) {
    arrayСarsleft[i].x = arrayСarsleft[i].distance+bgX+canvas.width;
    arrayСarsleft[i].y-=4;
    arrayСarsleft[i].draw();
    if (arrayСarsleft[i].y <= 0) {
      arrayСarsleft.splice(i, 1);
    }
  }

  for (let i = 0; i < arrayСarsRight.length; i++) {
    arrayСarsRight[i].x = arrayСarsRight[i].distance+bgX+canvas.width;
    arrayСarsRight[i].y+=4;
    arrayСarsRight[i].draw();
    if (arrayСarsRight[i].y >= canvas.height+200) {
      arrayСarsRight.splice(i, 1);
    }
  }
}


// Для 5 рівня
let arrayСarsTop = [];
let arrayСarsBottom = [];
let distanceСarsTop = 0;
let distanceСarsBottom = 0;
const roadTop = [205,250,295,340];
const roadBottom = [410,450,500,545];
// Створюємо авто на дорозі для 5 рівня
function addСars_5() {
  if (distanceСarsTop == 0) {
    let car = new cars();
    car.x=+canvas.width;
    car.y =+ roadTop[Math.floor(Math.random() * 3)];
    arrayСarsTop.push(car);
    distanceСarsTop=50;
  }
  if (distanceСarsBottom == 0) {
    let car = new cars();
    car.r = 180;
    car.x-=200;
    car.y += car.cars[car.model][1];
    car.y += roadBottom[Math.floor(Math.random() * 3)];
    arrayСarsBottom.push(car);
    distanceСarsBottom=200;
  }
  distanceСarsTop--;
  distanceСarsBottom--;
}
function level_5() {
  addСars_5();
  // Ставимо машину на свою полосу
  for (let i = 0; i < arrayСarsTop.length; i++) {
    arrayСarsTop[i].x-=4;
    arrayСarsTop[i].draw();
    if (arrayСarsTop[i].x <= -200) {
      arrayСarsTop.splice(i, 1);
    }
  }

  for (let i = 0; i < arrayСarsBottom.length; i++) {
    arrayСarsBottom[i].x++;
    arrayСarsBottom[i].draw();
    if (arrayСarsBottom[i].x >= canvas.width) {
      arrayСarsBottom.splice(i, 1);
    }
  }

  // Малюємо дві копії фонового зображення для створення безшовного ефекту
  ctx.drawImage(backgroundImage_2, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage_2, bgX + canvas.width, 0, canvas.width, canvas.height);
}



// Загрузка гри
let loading = {
  level: false,
  begin: 0, 
  end: 0
}
// Загружажмо зображення для ігри
function loadingImage(img) {
  loading.begin++;
  loading.level = false;
  const load = new Image();
  load.src = img;
  load.onload = function() {
    loading.end++;
    const indicator = document.getElementById('loading');
    indicator.style.display = 'flex';
    let percentage = 0;
    if (loading.begin !== 0) {
      percentage = Math.floor((loading.end * 100) / loading.begin);
    }
    indicator.getElementsByTagName('p')[0].textContent = 'Завантажено '+percentage+'%';
    if (loading.end == loading.begin) {
      loading.begin = 0;
      loading.end = 0;
      
      setTimeout(function() {
        indicator.style.display = 'none';
        loading.level = true;
        // Запуск фонової музики
        backgroundMusic.play();
        backgroundMusic.loop = true;
        document.getElementById('indicator-level').textContent = 'Рівень: '+level;
        enemyTime = 600;
        enemies = [];
        if (!renderGame) render();
        setTimeout(function() {
          if (!pause) enemyInterval = setInterval(addEnemy, enemyTime);
        }, 3000)
      }, 1000);
    }
  };
  return load;
}

// Звуки в ігрі
function loadingSound(audio) {
  const load = new Audio(audio);
  load.preload = 'auto';
  load.load();
  return load;
}

function load() {
  clearInterval(enemyInterval);
  collisionSound = loadingSound('sound/collision.mp3');
  lifeSound = loadingSound('sound/life.mp3');
  backgroundMusic = loadingSound('sound/background-music'+levelsGame[level-1].sound+'.mp3');

  backgroundImage = loadingImage('img/'+levelsGame[level-1].theme+'/grass.png');
  butterflyImage = loadingImage('img/butterfly-a.png');
  garbage = [];
  for(let i = 0; i < 5; i++){
    garbage[i] = loadingImage('img/'+levelsGame[level-1].theme+'/garbage-'+i+'.png');
  }
  lifeImage = loadingImage('img/life.png');
  keyImage = loadingImage('img/key.png');

  if (level == 2) {
    car = [];
    for(let i = 0; i < 8; i++){
      car[i] = loadingImage('img/car/car-'+(i+1)+'.png');
    }
  } else if (level == 5) {
    car = [];
    for(let i = 0; i < 8; i++){
      car[i] = loadingImage('img/car/car-'+(i+1)+'.png');
    }
    backgroundImage_2 = loadingImage('img/'+levelsGame[level-1].theme+'/grass-2.png');
  }
}
// Старт
document.getElementById('start').addEventListener('click', () => {
  // Встановлюємо розмір canvas на весь екран
  // canvas.width = window.screen.width;
  canvas.height = window.screen.height;
  canvas.style.display = 'block';
  // Увійти в повноекранний режим
  document.getElementsByTagName('body')[0].requestFullscreen();
  load();
  document.getElementById('background').style.display = 'none';
  document.getElementById('top-panel').style.display = 'flex';
});



let enemies = []; // Масив для збереження елементів що рухаються

// Додати ворога
function addEnemy() {
  const enemy = {
    name: 'enemy',
    x: canvas.width, // Початкова позиція ворога (правий край canvas)
    y: Math.random() * canvas.height-40, // Випадкова висота
    speed: Math.random() * 8 + 1, // Випадкова швидкість від 1 до 8
    img: Math.floor(Math.random() * 5),
  };
  enemies.push(enemy); // Додати ворога в масив
}

// Додати життя
function addLife() {
  const life = {
    name: 'life',
    x: canvas.width, // Початкова позиція життя (правий край canvas)
    y: Math.random() * canvas.height-40, // Випадкова висота
    speed: 6, // Випадкова швидкість 1
  };
  enemies.push(life); // Додати життя в масив
}

// Додати Ключ
function addKey() {
  const key = {
    name: 'key',
    x: canvas.width, // Початкова позиція життя (правий край canvas)
    y: Math.random() * canvas.height-40, // Випадкова висота
    speed: 7, // Випадкова швидкість 1
  };
  enemies.push(key); // Додати життя в масив
}


const butterfly = {
  frames: [0, 250, 500],
  time: 0,
  frame: 0,
  timeFrame: 8,

  x: 200,
  y: 300,
  r: 90,
  animation() {
    if (this.time == this.timeFrame) {
      this.frame = (this.frame + 1) % 3; // Use modulo to cycle frames
      this.time = 0;
    }
    this.time++;
  },
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.r * Math.PI / 180);
    ctx.drawImage(butterflyImage, this.frames[this.frame], 0, 250, 200, -(62.5/2), -(50/2), 62.5, 50);
    ctx.restore();
  },
  rotateButterfly() {
    if (this.r > 90) {
      this.r--;
    } else {
      this.r++;
    }

    if (butterflyY > this.y) {
      if (this.r > 20) {
        this.r -= 3;
      }
    } else if (butterflyY < this.y) {
      if (this.r < 160) {
        this.r += 3;
      }
    }

    butterflyY = this.y;
  }
}





document.addEventListener('touchstart', (event) => {
  touchY = event.touches[0].clientY;
  touchX = event.touches[0].clientX;
});

document.addEventListener('touchmove', (event) => {
  if (touchY !== null) {
    const newY = event.touches[0].clientY;
    const deltaY = newY - touchY;

    butterfly.y += deltaY*3; // Зміщуємо метелика по вертикалі
    touchY = newY; // Оновлюємо вертикальну координату дотику

    if (deltaY > 0) {
      // Рух пальця вниз
      if (butterfly.r < 160) {
        butterfly.r += 3;
      }
    } else if (deltaY < 0) {
      // Рух пальця вгору
      if (butterfly.r > 20) {
        butterfly.r -= 3;
      }
    }
  }
  if (touchX !== null) {
    const newX = event.touches[0].clientX;
    const deltaX = newX - touchX;

    butterfly.x += deltaX*3; // Зміщуємо метелика по горизонталі
    touchX = newX; // Оновлюємо вертикальну координату дотику
  }
});

document.addEventListener('touchend', () => {
  touchY = null;
  touchX = null;
});

if (!mobileDevice) {
  document.getElementsByTagName('body')[0].addEventListener('mousemove', function(event) {

    let canvasRect = canvas.getBoundingClientRect();
    let mouseY = event.clientY - canvasRect.top;
    let mouseX = event.clientX - canvasRect.left;

    if (butterfly.y > mouseY) {
      if (butterfly.r > 20) {
        butterfly.r-=3;
      }
    }else if (butterfly.y < mouseY) {
      if (butterfly.r < 160) {
      butterfly.r+=3;
      }
    }

    butterfly.y = mouseY;
    butterfly.x = mouseX;
  });
}




function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  
  if (levelsGame.length != level && newLevel >= '15000' && levelsGame[level-1].key <= keys) {
    keys -= levelsGame[level-1].key;
    level++;
    speedGame = 1; 
    backgroundMusic.pause();
    load();
    document.getElementById('indicator-level').textContent = 'Рівень: '+level;
    newLevel = 0; 
  }
  if (!mobileDevice) {
    if (newLevel == '5000') {
      speedGame = 2;
      clearInterval(enemyInterval);
      enemyTime = 400;
      enemyInterval = setInterval(addEnemy, enemyTime);
    }
    if (newLevel == '10000') {
      speedGame = 2;
      clearInterval(enemyInterval);
      enemyTime = 300;
      enemyInterval = setInterval(addEnemy, enemyTime);
    }
  }
  
  if (levelsGame.length == level && newLevel >= '15000' && levelsGame[level-1].key <= keys && endGame == false) {
    document.getElementById('end-game').style.display = 'flex';
    setTimeout(function() {document.getElementById('end-game').style.display = 'none';}, 3000);
    endGame = true;
  }
  
  newLevel++;

  // Малюємо дві копії фонового зображення для створення безшовного ефекту
  ctx.drawImage(backgroundImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, bgX + canvas.width, 0, canvas.width, canvas.height);
  // Зміщуємо позицію фону
  bgX -= 1 * speedGame; // Змінюйте це значення для зміни швидкості руху

  // Перевіряємо, чи фонове зображення повністю прокрутилося
  if (bgX <= -canvas.width) {
      bgX = 0;
  }


  // Малюємо унікальні рівні
  if (level == 2) level_2();
  if (level == 5) level_5();



  // Запускаємо метелика
  butterfly.animation();
  butterfly.rotateButterfly();
  butterfly.draw();

  if (mobileDevice) {
    if (touchY !== null) {
      // Обмеження руху метелика в межах canvas
      butterfly.y = Math.min(canvas.height - 50, Math.max(0, butterfly.y));
      butterfly.x = Math.min(canvas.width - 150, Math.max(100, butterfly.x));
    }
  }
  

  

  // Перевіряємо зіткнення метелика з ворогами
  for (let i = 0; i < enemies.length; i++) {
    if (
      butterfly.x < enemies[i].x + 60 &&
      butterfly.x + 31.25 > enemies[i].x &&
      butterfly.y < enemies[i].y + 60 &&
      butterfly.y + 25 > enemies[i].y
    ) {
      // Зіткнення сталося
      if (enemies[i].name == 'enemy') {
        collisionSound.currentTime = 0; // Скидання до початку аудіо
        collisionSound.play(); // Відтворення звуку зіткнення
        lives--;
      }else if (enemies[i].name == 'life') {
        lifeSound.currentTime = 0; // Скидання до початку аудіо
        lifeSound.play(); // Відтворення звуку збільшення життя
        lives++;
      }else if (enemies[i].name == 'key') {
        lifeSound.currentTime = 0; // Скидання до початку аудіо
        lifeSound.play(); // Відтворення звуку збільшення життя
        keys++;
      }
      enemies.splice(i, 1);
      i--;
    } else {
      // Якщо немає зіткнення, малювати ворога
      enemies[i].x -= enemies[i].speed * speedGame;
      if (enemies[i].x < 0) {
        enemies.splice(i, 1);
        i--;
      }
    }
  }

  // Малювати елементи що рухаються
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].name == 'enemy') {
      ctx.drawImage(garbage[enemies[i].img], 0, 0, 100, 100, enemies[i].x, enemies[i].y, 60, 60);
    }else if (enemies[i].name == 'life') {
      ctx.drawImage(lifeImage, 0, 0, 100, 100, enemies[i].x, enemies[i].y, 60, 60);
    }else if (enemies[i].name == 'key') {
      ctx.drawImage(keyImage, 0, 0, 100, 100, enemies[i].x, enemies[i].y, 60, 60);
    }
  }

  // Малювати індикацію ігри
  document.getElementById('indicator-life').textContent = 'Життя: '+lives;
  document.getElementById('indicator-key').textContent = 'Ключів: '+keys+' / '+ levelsGame[level-1].key;
  document.getElementById('indicator-distance').textContent = 'Пройдена відстань: '+(distance/100).toFixed(0)+' м.';

  distance+=1*speedGame;
  distanceLife--;
  if (distanceLife <= 0) {
    addLife();
    distanceLife = 1000;
  }
  distanceKeys--;
  if (distanceKeys <= 0) {
    addKey();
    distanceKeys = 2500;
  }

  // Перевіряємо кількість життів
  if (lives <= 0) {
    // Гра закінчилася, додайте тут логіку завершення гри
    clearInterval(enemyInterval);
    backgroundMusic.pause();
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.fillText('Гра завершена', canvas.width / 2 - 100, canvas.height / 2);
    renderGame = false;
  } else {
    if (!pause) {
      renderGame = true;
      requestAnimationFrame(render);
    }else {
      renderGame = false;
    }
  }
}



document.getElementById('pause').addEventListener('click', () => {
  const button = document.getElementById('pause');
  
  if (button.textContent == 'Пауза') {
    button.textContent = 'Продовжити';
    pause = true;
    clearInterval(enemyInterval);
    backgroundMusic.pause();
  }else {
    button.textContent = 'Пауза';
    pause = false;
    backgroundMusic.play();
    render();
    // Додати нового ворога з інтервалом
    enemyInterval = setInterval(addEnemy, enemyTime); // Додавати нового ворога кожні 2 секунди
  }

});

document.getElementById('restart').addEventListener('click', () => {
    keys = 0;
    newLevel = 0;
    level = 1;
    speedGame = 1;
    backgroundMusic.pause();
    distance = 0;
    lives = 6;
    endGame = false;
    load();
});

document.getElementById('screen-size').addEventListener('click', () => {
  const button = document.getElementById('screen-size');
  
  if (document.fullscreenElement) {
    button.textContent = 'Збільшити екран';
    document.exitFullscreen();
  }else {
    button.textContent = 'Зменшити екран';
    document.getElementsByTagName('body')[0].requestFullscreen();
  }
});
