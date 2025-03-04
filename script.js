document.addEventListener("DOMContentLoaded", function () {
    const svg = document.querySelector("svg");
    const grid = document.querySelector("#grid");
    const nodeGroup = document.getElementById("nodes");
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");
    const addNodeButtons = document.querySelectorAll("[data-type]");
    let scale = 1;
    let zoomLevel = 0;
    const zoomMax = 5;
    const zoomMin = -5;
    let nodeCount = 0;
    let isDragging = false;
    let activeNode = null;
    let offsetX, offsetY;

    // 노드 타입 설정 (추가 가능)
    const nodeTypes = {
        circle: { shape: "circle", color: "blue", size: 100 },
        square: { shape: "circle", color: "red", size: 100 },
        triangle: { shape: "circle", color: "green", size: 100 }
    };

    // SVG 크기를 부모 크기에 맞춤
    function resizeSVG() {
        const parent = svg.parentElement;
        svg.setAttribute("width", parent.clientWidth);
        svg.setAttribute("height", parent.clientHeight);
        updateGrid();
    }

    // 그리드 및 노드 그룹 업데이트 함수
    function updateGrid() {
        const size = 20 * scale; // 그리드 간격
        let gridPattern = "";
        for (let x = 0; x < svg.clientWidth; x += size) {
            gridPattern += `<line x1='${x}' y1='0' x2='${x}' y2='${svg.clientHeight}' stroke='#ddd' stroke-width='1'/>`;
        }
        for (let y = 0; y < svg.clientHeight; y += size) {
            gridPattern += `<line x1='0' y1='${y}' x2='${svg.clientWidth}' y2='${y}' stroke='#ddd' stroke-width='1'/>`;
        }
        grid.innerHTML = gridPattern;
        nodeGroup.setAttribute("transform", `scale(${scale})`);
    }

    // 줌 인/아웃 기능 (마우스 휠) - 최대 5번 줌 인/아웃 제한
    svg.addEventListener("wheel", (event) => {
        event.preventDefault();
        zoom(event.deltaY < 0 ? 1 : -1);
    });

    // 줌 기능 (버튼과 휠 공통 사용)
    function zoom(direction) {
        const zoomFactor = 0.1;
        if (direction > 0 && zoomLevel < zoomMax) {
            scale *= 1 + zoomFactor;
            zoomLevel++;
        } else if (direction < 0 && zoomLevel > zoomMin) {
            scale *= 1 - zoomFactor;
            zoomLevel--;
        }
        updateGrid();
    }

    // 줌 인/아웃 버튼 이벤트
    zoomInBtn.addEventListener("click", () => zoom(1));
    zoomOutBtn.addEventListener("click", () => zoom(-1));
    
    // 노드 추가 버튼 이벤트 리스너
    addNodeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const type = button.getAttribute("data-type");
            if (nodeTypes[type]) {
                addNode(type);
            }
        });
    });

    // 노드 추가 기능
    function addNode(type) {
        const { shape, color, size } = nodeTypes[type];
        let newNode;
        if (shape === "circle") {
            newNode = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            newNode.setAttribute("cx", 100 + nodeCount * 100);
            newNode.setAttribute("cy", 100);
            newNode.setAttribute("r", size / 2);
        } else if (shape === "rect") {
            newNode = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            newNode.setAttribute("x", 100 + nodeCount * 100 - size / 2);
            newNode.setAttribute("y", 100 - size / 2);
            newNode.setAttribute("width", size);
            newNode.setAttribute("height", size);
        } else if (shape === "polygon") {
            newNode = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const x = 100 + nodeCount * 100;
            const y = 100;
            newNode.setAttribute("points", `${x},${y - size} ${x - size / 2},${y + size / 2} ${x + size / 2},${y + size / 2}`);
        }
        newNode.setAttribute("fill", color);
        newNode.setAttribute("style", "cursor: pointer;");
        newNode.classList.add("node");
        newNode.addEventListener("mousedown", startDrag);
        nodeGroup.appendChild(newNode);
        nodeCount++;
    }

    // 노드 드래그 기능
    function startDrag(event) {
        isDragging = true;
        activeNode = event.target;
        offsetX = event.clientX - parseFloat(activeNode.getAttribute("cx") || activeNode.getAttribute("x"));
        offsetY = event.clientY - parseFloat(activeNode.getAttribute("cy") || activeNode.getAttribute("y"));
    }

    function drag(event) {
        if (!isDragging || !activeNode) return;
        let x = (event.clientX - offsetX) / scale;
        let y = (event.clientY - offsetY) / scale;
        if (activeNode.tagName === "circle") {
            activeNode.setAttribute("cx", x);
            activeNode.setAttribute("cy", y);
        } else if (activeNode.tagName === "rect") {
            activeNode.setAttribute("x", x);
            activeNode.setAttribute("y", y);
        }
    }

    function endDrag() {
        isDragging = false;
        activeNode = null;
    }

    // 드래그 이벤트 리스너
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", endDrag);

    // 윈도우 리사이즈 시 SVG 크기 조정
    window.addEventListener("resize", resizeSVG);
    resizeSVG();
});