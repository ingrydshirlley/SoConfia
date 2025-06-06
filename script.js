const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 40;
const rows = 10;
const cols = 14;

let passosComFe = 0;
let revealedFaithBlocks = new Set();

let modeFe = false;

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
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const tile = map[y][x];
            if (tile === 1) {
                ctx.fillStyle = '#8b5e3c'; // parede: marrom deserto
            } else if (tile === 0) {
                ctx.fillStyle = '#f5f1da'; // caminho visível: areia clara
            } else if (tile === 2) {
                ctx.fillStyle = '#0077be'; // jogador: azul forte (explorador)
            } else if (tile === 3) {
                ctx.fillStyle = modeFe ? '#f7d88c' : '#f5f1da'; // caminho verdadeiro
            } else if (tile === 4) {
                ctx.fillStyle = '#d2691e'; // chegada: tenda ou palmeira marrom avermelhado
            }
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            ctx.strokeStyle = '#c2b280'; // cor da grade, estilo areia mais clara
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
    const isChegada = map[newY][newX] === 4; // 👈 checa antes de substituir

    if (map[newY][newX] === 3 && modeFe && !revealedFaithBlocks.has(key)) {
        passosComFe++;
        revealedFaithBlocks.add(key);

        const scoreEl = document.getElementById('score');
        scoreEl.innerText = `Passos com fé: ${passosComFe}`;
        scoreEl.classList.add('highlight');
        setTimeout(() => {
            scoreEl.classList.remove('highlight');
        }, 500);
    }

    map[player.y][player.x] = 0;
    player.x = newX;
    player.y = newY;
    map[player.y][player.x] = 2;

    drawMap();
    document.getElementById('score').innerText = `Passos com fé: ${passosComFe}`;

    if (isChegada) {
        setTimeout(() => {
            alert(`Parabéns! Você confiou e chegou ao destino com ${passosComFe} passos de fé.`);
        }, 100);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') movePlayer(0, -1);
    if (e.key === 'ArrowDown') movePlayer(0, 1);
    if (e.key === 'ArrowLeft') movePlayer(-1, 0);
    if (e.key === 'ArrowRight') movePlayer(1, 0);
    if (e.key.toLowerCase() === 'f') {
        modeFe = !modeFe;
        drawMap();
    }
});

drawMap();
