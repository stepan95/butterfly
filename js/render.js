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
        
        if (!renderGame) render();
        setTimeout(function() {
          enemyInterval = setInterval(addEnemy, enemyTime);
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
  }
}

function rotateButterfly() {
  if (butterfly.r > 90) {
    butterfly.r--;
  } else {
    butterfly.r++;
  }

  if (butterflyY > butterfly.y) {
    if (butterfly.r > 20) {
      butterfly.r -= 3;
    }
  } else if (butterflyY < butterfly.y) {
    if (butterfly.r < 160) {
      butterfly.r += 3;
    }
  }

  butterflyY = butterfly.y;
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
    clearInterval(enemyInterval);
    enemyTime = 600;
    enemies = [];
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

  // Запускаємо метелика
  butterfly.animation();
  rotateButterfly();
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
    clearInterval(enemyInterval);
    enemyTime = 600;
    enemies = [];
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
