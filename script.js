const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const rows = 10;
const cols = 14;

let tileSize = 40; 

let passosComFe = 0;
let revealedFaithBlocks = new Set();

let modeFe = false;

// Mapa:
// 0: caminho visível (errado)
// 1: parede
// 2: jogador
// 3: caminho verdadeiro (invisível sem fé)
// 4: chegada

const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 1, 3, 3, 3, 1, 0, 0, 0, 4, 1],
    [1, 1, 1, 0, 1, 1, 1, 3, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 3, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 3, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1],
    [1, 3, 3, 0, 0, 0, 0, 1, 0, 3, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let player = { x: 1, y: 1 };

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const tile = map[y][x];
            let fillColor;

            if (tile === 1) {
                fillColor = '#8b5e3c'; // parede: marrom deserto
            } else if (tile === 0) {
                fillColor = '#f5f1da'; // caminho visível: areia clara
            } else if (tile === 2) {
                fillColor = '#0077be'; // jogador: azul forte
            } else if (tile === 3) {
                fillColor = modeFe ? '#f7d88c' : '#f5f1da'; // caminho verdadeiro
            } else if (tile === 4) {
                fillColor = '#d2691e'; // chegada
            }

            ctx.fillStyle = fillColor;
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

            ctx.strokeStyle = '#c2b280'; // cor da grade estilo areia clara
            ctx.lineWidth = 1;
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

function canMove(x, y) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return false;
    const target = map[y][x];
    if (target === 1) return false;
    if (target === 0) return true;
    if (target === 3) return modeFe;
    if (target === 4) return true;
    return false;
}

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (!canMove(newX, newY)) return;

    const key = `${newX},${newY}`;
    const isChegada = map[newY][newX] === 4;

    if (map[newY][newX] === 3 && modeFe && !revealedFaithBlocks.has(key)) {
        passosComFe++;
        revealedFaithBlocks.add(key);

        const scoreEl = document.getElementById('score');
        scoreEl.innerText = `Passos com fé: ${passosComFe}`;
        scoreEl.classList.add('highlight');
        setTimeout(() => scoreEl.classList.remove('highlight'), 500);
    }

    map[player.y][player.x] = 0;
    player.x = newX;
    player.y = newY;
    map[player.y][player.x] = 2;

    drawMap();

    if (isChegada) {
        setTimeout(() => alert('Você venceu! Fé que salva. ✨'), 100);
    }
}

function toggleFe() {
    modeFe = !modeFe;
    drawMap();
}

function resizeCanvas() {
    const containerWidth = document.querySelector('.container').clientWidth;
    canvas.width = containerWidth;
    canvas.height = containerWidth * (400 / 560);
    tileSize = canvas.width / cols;
    drawMap();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('keydown', (e) => {
    if (e.repeat) return; 

    switch (e.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
        case 'f':
        case 'F':
            toggleFe();
            break;
    }
});

document.getElementById('upBtn').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('downBtn').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('leftBtn').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('rightBtn').addEventListener('click', () => movePlayer(1, 0));
document.getElementById('faithBtn').addEventListener('click', toggleFe);
