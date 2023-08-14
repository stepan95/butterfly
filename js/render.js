const canvas = document.getElementById('games');
const ctx = canvas.getContext('2d');


// Встановлюємо розмір canvas на весь екран
// canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


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

let touchY = null; // Початкове значення

let endGame = false;
let distance = 0;
let keys = 0;
let pause = false;
let distanceKeys = 1500;
let collisionSound, lifeSound, backgroundMusic, backgroundImage, butterflyImage, garbage, lifeImage;
let enemyInterval;
let newLevel = 0;
let lives = 6; // Кількість життів '6'
let distanceLife = 1000; // Дестанція для життя '1000'
let bgX = 0; // Початкова позиція фону
let speedGame = 1; // Швидкість ігри '1'
let enemyTime = 600; // Час до появи ворога '600'
let level = 1; // Рівень


// Звуки в ігрі
function load() {
  collisionSound = new Audio('sound/collision.mp3');
  collisionSound.preload = 'auto';
  collisionSound.load();
  lifeSound = new Audio('sound/life.mp3');
  lifeSound.preload = 'auto';
  lifeSound.load();
  backgroundMusic = new Audio('sound/background-music'+levelsGame[level-1].sound+'.mp3');
  backgroundMusic.preload = 'auto';
  backgroundMusic.load();

  // Загружажмо зображення для ігри
  backgroundImage = new Image();
  backgroundImage.src = 'img/'+levelsGame[level-1].theme+'/grass.png';

  butterflyImage = new Image();
  butterflyImage.src = 'img/butterfly-a.png';


  garbage = [];
  for(let i = 0; i < 5; i++){
    garbage.push(new Image());
    garbage[i].src = 'img/'+levelsGame[level-1].theme+'/garbage-'+i+'.png';
  }

  lifeImage = new Image();
  lifeImage.src = 'img/life.png';

  keyImage = new Image();
  keyImage.src = 'img/key.png';


  // Завантаження всіх ресурсів
  Promise.all([
    new Promise((resolve, reject) => {
      backgroundImage.onload = resolve;
      backgroundImage.onerror = reject;
    }),
    new Promise((resolve, reject) => {
      lifeImage.onload = resolve;
      lifeImage.onerror = reject;
    }),
    new Promise((resolve, reject) => {
      keyImage.onload = resolve;
      keyImage.onerror = reject;
    }),
    // Додайте решту зображень та звуків тут
  ]).then(() => {
    // Всі ресурси завантажені, можна запускати гру
    document.getElementById('start').addEventListener('click', () => {
      // Встановлюємо розмір canvas на весь екран
      // canvas.width = window.screen.width;
      canvas.height = window.screen.height;
      canvas.style.display = 'block';
      // Увійти в повноекранний режим
      document.getElementsByTagName('body')[0].requestFullscreen();
      render();
      // Запуск фонової музики
      backgroundMusic.play();
      backgroundMusic.loop = true;
      document.getElementById('background').style.display = 'none';
    });
    
  });
}

load();



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
  }
}

let directionForward = true;
function rotateButterfly() {
  if (butterfly.r > 90) {
    butterfly.r--;
  }else {
    butterfly.r++;
  }
  
  if (directionForward == true) {
    butterfly.x++;
    if (butterfly.x >= 550) {
      directionForward = false;
    }
  }
  if (directionForward == false) {
    butterfly.x--;
    if (butterfly.x <= 150) {
      directionForward = true;
    } 
  }
} 

document.getElementsByTagName('body')[0].addEventListener('mousemove', function(event) {

  let canvasRect = canvas.getBoundingClientRect();
  let mouseY = event.clientY - canvasRect.top;

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
});
document.addEventListener('touchstart', (event) => {
  touchY = event.touches[0].clientY; // Запам'ятовуємо вертикальну координату дотику
});

document.addEventListener('touchmove', (event) => {
  if (touchY !== null) {
    const newY = event.touches[0].clientY;
    const deltaY = newY - touchY;

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
    butterfly.y =deltaY;
    touchY = newY; // Оновлюємо вертикальну координату дотику
  }
});



function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  
  if (levelsGame.length != level && newLevel >= '15000' && levelsGame[level-1].key <= keys) {
    keys -= levelsGame[level-1].key;
    level++;
    speedGame = 1;
    clearInterval(enemyInterval);
    enemyTime = 600;
    enemies = [];
    enemyInterval = setInterval(addEnemy, enemyTime);
    backgroundMusic.pause();
    load();
    backgroundMusic.play();
    backgroundMusic.loop = true;
    document.getElementById('indicator-level').textContent = 'Рівень: '+level;
    newLevel = 0; 
  }
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

  // Запускаємо метелика
  butterfly.animation();
  rotateButterfly();
  butterfly.draw();

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
  document.getElementById('indicator-distance').textContent = 'Пройдена відстань: '+(distance/100)+' м.';
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
  } else {
    if (!pause) {
      requestAnimationFrame(animate);
    }
  }
}


function render() {

  animate();

  // Додати нового ворога з інтервалом
  enemyInterval = setInterval(addEnemy, enemyTime); // Додавати нового ворога кожні 2 секунди
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
  }

});

document.getElementById('restart').addEventListener('click', () => {
    keys = 0;
    newLevel = 0;
    level = 1;
    speedGame = 1;
    clearInterval(enemyInterval);
    enemyTime = 600;
    enemies = [];
    backgroundMusic.pause();
    distance = 0;
    lives = 6;
    endGame = false;
    load();
    backgroundMusic.play();
    backgroundMusic.loop = true;
    document.getElementById('indicator-level').textContent = 'Рівень: '+level;
    render()
});

document.getElementById('screen-size').addEventListener('click', () => {
  const button = document.getElementById('screen-size');
  
  if (button.textContent == 'Зменшити екран') {
    button.textContent = 'Збільшити екран';
    document.exitFullscreen();
  }else {
    button.textContent = 'Зменшити екран';
    document.getElementsByTagName('body')[0].requestFullscreen();
  }
});
