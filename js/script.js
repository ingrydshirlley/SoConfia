// Maze game logic

// Ajusta o tamanho do canvas para responsividade
function resizeCanvas() {
    const canvas = document.getElementById('maze');
    const containerWidth = Math.min(window.innerWidth * 0.98, 600);
    canvas.style.width = containerWidth + "px";
    canvas.style.height = (containerWidth * 428 / 600) + "px";
}
window.addEventListener('resize', resizeCanvas);

// Parâmetros do labirinto
const canvasWidth = 600;
const canvasHeight = 428;
const cols = 30;
const rows = 21;
const tileSizeX = Math.floor(canvasWidth / cols);
const tileSizeY = Math.floor(canvasHeight / rows);

// Variáveis de estado do jogo
let maze = [];
let player = { x: 1, y: 1 };
let goal = { x: cols - 2, y: rows - 2 };
let showPath = false;
let solutionPath = [];
let currentPathIndex = 0;
let passosFe = 0;
let usandoFe = false;

// Carrega a imagem do personagem (logo)
const playerImg = new Image();
playerImg.src = "https://forcajovemuniversal.com/wp-content/uploads/2021/02/patch_universitarios-1536x1536.png";
playerImg.crossOrigin = "anonymous";

/**
 * Gera um labirinto com múltiplos caminhos usando DFS e remove paredes extras.
 */
function generateMazeWithMultiplePaths(cols, rows) {
    let maze = Array.from({length: rows}, () => Array(cols).fill(1));
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function carve(x, y) {
        maze[y][x] = 0;
        let dirs = shuffle([[0, -2], [0, 2], [-2, 0], [2, 0]]);
        for (let [dx, dy] of dirs) {
            let nx = x + dx, ny = y + dy;
            if (ny > 0 && ny < rows && nx > 0 && nx < cols && maze[ny][nx] === 1) {
                maze[y + dy/2][x + dx/2] = 0;
                carve(nx, ny);
            }
        }
    }
    carve(1, 1);
    maze[1][0] = 0; // Entrada
    maze[rows-2][cols-1] = 0; // Saída

    // Adiciona múltiplos caminhos removendo paredes aleatórias
    let extraPaths = Math.floor(cols * 1.5);
    for (let i = 0; i < extraPaths; i++) {
        let x = Math.floor(Math.random() * (cols - 2)) + 1;
        let y = Math.floor(Math.random() * (rows - 2)) + 1;
        if (maze[y][x] === 1) {
            let openSides = 0;
            for (let [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
                let nx = x + dx, ny = y + dy;
                if (maze[ny][nx] === 0) openSides++;
            }
            if (openSides >= 2) {
                maze[y][x] = 0;
            }
        }
    }
    return maze;
}

/**
 * Busca o caminho correto do labirinto usando BFS.
 * @param {Array} maze - Matriz do labirinto
 * @param {Object} start - Posição inicial {x, y}
 * @param {Object} end - Posição final {x, y}
 * @returns {Array} Caminho como array de objetos {x, y}
 */
function findPathBFS(maze, start, end) {
    let queue = [[start]];
    let visited = Array.from({length: rows}, () => Array(cols).fill(false));
    visited[start.y][start.x] = true;
    while (queue.length > 0) {
        let path = queue.shift();
        let {x, y} = path[path.length - 1];
        if (x === end.x && y === end.y) return path;
        for (let [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
            let nx = x + dx, ny = y + dy;
            if (
                nx >= 0 && nx < cols && ny >= 0 && ny < rows &&
                maze[ny][nx] === 0 && !visited[ny][nx]
            ) {
                visited[ny][nx] = true;
                queue.push([...path, {x: nx, y: ny}]);
            }
        }
    }
    return [];
}

/**
 * Desenha o labirinto, personagem, destino e caminho de fé (se ativado).
 */
function drawMaze() {
    const canvas = document.getElementById('maze');
    const ctx = canvas.getContext('2d');
    // Ajusta para retina/dispositivos de alta densidade
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
    const scaleX = canvas.width / canvasWidth;
    const scaleY = canvas.height / canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Desenha o labirinto
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.fillStyle = maze[y][x] === 1 ? "rgba(139, 94, 60, 0.7)" : "#fff";
            ctx.fillRect(
                x * tileSizeX * scaleX, 
                y * tileSizeY * scaleY, 
                tileSizeX * scaleX, 
                tileSizeY * scaleY
            );
        }
    }
    // Caminho verdadeiro (se ativado)
    if (showPath && solutionPath.length > 0) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 4 * Math.max(scaleX, scaleY);
        ctx.beginPath();
        for (let i = currentPathIndex; i < solutionPath.length; i++) {
            let {x, y} = solutionPath[i];
            let cx = x * tileSizeX * scaleX + (tileSizeX * scaleX) / 2;
            let cy = y * tileSizeY * scaleY + (tileSizeY * scaleY) / 2;
            if (i === currentPathIndex) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
    }
    // Destino
    ctx.fillStyle = 'green';
    ctx.fillRect(
        goal.x * tileSizeX * scaleX + 4 * scaleX, 
        goal.y * tileSizeY * scaleY + 4 * scaleY, 
        tileSizeX * scaleX - 8 * scaleX, 
        tileSizeY * scaleY - 8 * scaleY
    );
    // Personagem (logo)
    if (playerImg.complete && playerImg.naturalWidth > 0) {
        const margin = Math.floor(Math.min(tileSizeX * scaleX, tileSizeY * scaleY) * 0.10);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
            playerImg,
            player.x * tileSizeX * scaleX + margin, 
            player.y * tileSizeY * scaleY + margin, 
            tileSizeX * scaleX - 2 * margin, 
            tileSizeY * scaleY - 2 * margin
        );
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(
            player.x * tileSizeX * scaleX + 4 * scaleX, 
            player.y * tileSizeY * scaleY + 4 * scaleY, 
            tileSizeX * scaleX - 8 * scaleX, 
            tileSizeY * scaleY - 8 * scaleY
        );
    }
    // Atualiza contador de passos de fé
    const passosDiv = document.getElementById('passos-fe');
    if (usandoFe && passosFe > 0) {
        passosDiv.textContent = `Passos de fé: ${passosFe}`;
    } else {
        passosDiv.textContent = '';
    }
}

/**
 * Move o personagem no labirinto.
 * @param {number} dx - Direção X
 * @param {number} dy - Direção Y
 */
function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (
        newY >= 0 && newY < rows &&
        newX >= 0 && newX < cols &&
        maze[newY][newX] === 0
    ) {
        let seguindoFe = false;
        // Se estiver usando fé, conta os passos no caminho correto
        if (usandoFe && solutionPath.length > 0) {
            if (
                currentPathIndex < solutionPath.length - 1 &&
                solutionPath[currentPathIndex + 1].x === newX &&
                solutionPath[currentPathIndex + 1].y === newY
            ) {
                currentPathIndex++;
                passosFe++;
                seguindoFe = true;
            }
        }
        player.x = newX;
        player.y = newY;

        drawMaze();
        // Chegou ao destino
        if (player.x === goal.x && player.y === goal.y) {
            document.getElementById('mensagem').innerHTML = "Parabéns! Você chegou ao destino!";
            showVictoryPopup();
        }
    }
}

/**
 * Alterna a exibição do caminho de fé (ativa/desativa).
 */
function toggleFaithPath() {
    if (showPath) {
        // Oculta o caminho
        showPath = false;
        usandoFe = false;
        passosFe = 0;
        drawMaze();
    } else {
        // Mostra o caminho a partir da posição atual
        solutionPath = findPathBFS(maze, player, goal);
        showPath = true;
        usandoFe = true;
        passosFe = 0;
        // Encontra o índice do jogador no caminho
        currentPathIndex = 0;
        for (let i = 0; i < solutionPath.length; i++) {
            if (solutionPath[i].x === player.x && solutionPath[i].y === player.y) {
                currentPathIndex = i;
                break;
            }
        }
        drawMaze();
    }
}

/**
 * Exibe o pop-up de vitória.
 */
function showVictoryPopup() {
    const popup = document.getElementById('victory-popup');
    popup.style.display = 'flex';
    document.getElementById('victory-close').onclick = function() {
        popup.style.display = 'none';
    };
}

// Pop-up de ajuda
document.getElementById('btn-help').onclick = function() {
    document.getElementById('help-popup').style.display = 'flex';
};
document.getElementById('help-close').onclick = function() {
    document.getElementById('help-popup').style.display = 'none';
};

// Botões principais
document.getElementById('btn-restart').onclick = function() {
    startGame();
};
document.getElementById('btn-reset').onclick = function() {
    // Reinicia o jogador para o início, oculta o caminho, zera passos de fé
    player = { x: 1, y: 1 };
    showPath = false;
    usandoFe = false;
    passosFe = 0;
    currentPathIndex = 0;
    document.getElementById('mensagem').innerHTML =
        'Use as setas para mover. Pressione <b>F</b> para ativar a fé e revelar o caminho verdadeiro.';
    drawMaze();
};
document.getElementById('faithBtn').onclick = function() {
    toggleFaithPath();
};

// Controles mobile
document.getElementById('upBtn').onclick = function() { movePlayer(0, -1); };
document.getElementById('downBtn').onclick = function() { movePlayer(0, 1); };
document.getElementById('leftBtn').onclick = function() { movePlayer(-1, 0); };
document.getElementById('rightBtn').onclick = function() { movePlayer(1, 0); };

// Teclado
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') movePlayer(0, -1);
    else if (e.key === 'ArrowDown') movePlayer(0, 1);
    else if (e.key === 'ArrowLeft') movePlayer(-1, 0);
    else if (e.key === 'ArrowRight') movePlayer(1, 0);
    else if (e.key.toLowerCase() === 'f') {
        toggleFaithPath();
    }
});

// Redesenha o personagem quando a imagem carregar
playerImg.onload = function() {
    drawMaze();
};

/**
 * Inicia ou reinicia o jogo, gerando novo labirinto e resetando estados.
 */
function startGame() {
    maze = generateMazeWithMultiplePaths(cols, rows);
    player = { x: 1, y: 1 };
    goal = { x: cols - 2, y: rows - 2 };
    solutionPath = [];
    showPath = false;
    currentPathIndex = 0;
    usandoFe = false;
    passosFe = 0;
    document.getElementById('mensagem').innerHTML =
        'Use as setas para mover. Pressione <b>F</b> para ativar a fé e revelar o caminho verdadeiro.';
    drawMaze();
}

// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    startGame();
});
window.addEventListener('resize', resizeCanvas);