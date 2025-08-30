(function(ext) {
    ext._shutdown = function() {};
    ext._getStatus = function() {
        return {status: 2, msg: 'Готов к рисованию!'};
    };

    var canvas = null;
    var ctx = null;
    var isDrawing = false;
    var currentColor = '#ff0000';
    var pixelSize = 10;
    var canvasSize = 400;
    var colorPicker = null;

    var descriptor = {
        blocks: [
            [' ', 'показать холст для рисования', 'showCanvas'],
            [' ', 'спрятать холст', 'hideCanvas'],
            [' ', 'установить цвет %s', 'setColor', '#ff0000'],
            [' ', 'установить RGB цвет R: %n G: %n B: %n', 'setRGBColor', 255, 0, 0],
            [' ', 'установить размер пикселя %n', 'setPixelSize', 10],
            [' ', 'очистить холст', 'clearCanvas'],
            [' ', 'залить холст цветом %s', 'fillCanvas', '#ffffff'],
            [' ', 'нарисовать пиксель на X: %n Y: %n', 'drawPixel', 100, 100],
            ['r', 'текущий цвет', 'getCurrentColor'],
            ['r', 'красный компонент', 'getRed'],
            ['r', 'зеленый компонент', 'getGreen'],
            ['r', 'синий компонент', 'getBlue'],
            [' ', 'показать палитру цветов', 'showColorPicker'],
            [' ', 'спрятать палитру цветов', 'hideColorPicker'],
            [' ', 'сохранить как изображение', 'saveAsImage'],
            [' ', 'сгенерировать случайный арт', 'generateRandomArt'],
            [' ', 'рисовать линию из X: %n Y: %n в X: %n Y: %n', 'drawLine', 50, 50, 150, 150],
            [' ', 'рисовать прямоугольник X: %n Y: %n Ш: %n В: %n', 'drawRect', 50, 50, 100, 100],
            [' ', 'рисовать круг X: %n Y: %n Р: %n', 'drawCircle', 100, 100, 50]
        ],
        menus: {
        },
    };

    function initCanvas() {
        if (canvas) return;
        
        canvas = document.createElement('canvas');
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        canvas.style.position = 'fixed';
        canvas.style.top = '100px';
        canvas.style.right = '250px';
        canvas.style.border = '2px solid #333';
        canvas.style.backgroundColor = '#ffffff';
        canvas.style.zIndex = '9999';
        canvas.style.display = 'none';
        canvas.style.cursor = 'crosshair';
        
        ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = currentColor;
        
        document.body.appendChild(canvas);
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
    }

    function createColorPicker() {
        if (colorPicker) return;
        
        colorPicker = document.createElement('div');
        colorPicker.style.position = 'fixed';
        colorPicker.style.top = '100px';
        colorPicker.style.right = '20px';
        colorPicker.style.width = '200px';
        colorPicker.style.padding = '15px';
        colorPicker.style.background = '#fff';
        colorPicker.style.border = '2px solid #333';
        colorPicker.style.borderRadius = '10px';
        colorPicker.style.zIndex = '10000';
        colorPicker.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        colorPicker.style.display = 'none';
        
        colorPicker.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #333;">🎨 Палитра цветов</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Цветовой круг:</label>
                <input type="color" id="colorWheel" value="${currentColor}" style="width: 100%; height: 40px;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">R: <span id="redValue">255</span></label>
                <input type="range" id="redSlider" min="0" max="255" value="255" style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">G: <span id="greenValue">0</span></label>
                <input type="range" id="greenSlider" min="0" max="255" value="0" style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">B: <span id="blueValue">0</span></label>
                <input type="range" id="blueSlider" min="0" max="255" value="0" style="width: 100%;">
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div id="currentColorBox" style="width: 50px; height: 50px; background: ${currentColor}; border: 2px solid #333;"></div>
                <div style="flex: 1; margin-left: 10px;">
                    <div style="font-size: 12px;">HEX: <span id="hexValue">${currentColor}</span></div>
                    <div style="font-size: 12px;">RGB: <span id="rgbValue">255,0,0</span></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 15px;">
                <div style="background: #ff0000; height: 20px; border: 1px solid #ccc; cursor: pointer;" onclick="setPresetColor('#ff0000')"></div>
                <div style="background: #00ff00; height: 20px; border: 1px solid #ccc; cursor: pointer;" onclick="setPresetColor('#00ff00')"></div>
                <div style="background: #0000ff; height: 20px; border: 1px solid #ccc; cursor: pointer;" onclick="setPresetColor('#0000ff')"></div>
                <div style="background: #ffff00; height: 20px; border: 1px solid #ccc; cursor: pointer;" onclick="setPresetColor('#ffff00')"></div>
                <div style="background: #ff00ff; height: 20px; border: 1px solid #ccc; cursor: pointer;" onclick="setPresetColor('#ff00ff')"></div>
                <div style="background: #00ffff; height: 20px; border: 1px solid #ccc; cursor: pointer;" onclick="setPresetColor('#00ffff')"></div>
                <div style="background: #000000; height: 20px; border: 1px solid #ccc; cursor: pointer;" onclick="setPresetColor('#000000')"></div>
                <div style="background: #ffffff; height: 20px; border: 1px solid #ccc; cursor: pointer;" onclick="setPresetColor('#ffffff')"></div>
            </div>
            
            <button onclick="window.ext.hideColorPicker()" style="width: 100%; padding: 8px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Закрыть
            </button>
        `;
        
        document.body.appendChild(colorPicker);
        
        const colorWheel = colorPicker.querySelector('#colorWheel');
        const redSlider = colorPicker.querySelector('#redSlider');
        const greenSlider = colorPicker.querySelector('#greenSlider');
        const blueSlider = colorPicker.querySelector('#blueSlider');
        
        colorWheel.addEventListener('input', function() {
            currentColor = this.value;
            updateColorFromHex(currentColor);
            updateColorDisplay();
        });
        
        redSlider.addEventListener('input', function() {
            updateColorFromRGB();
        });
        
        greenSlider.addEventListener('input', function() {
            updateColorFromRGB();
        });
        
        blueSlider.addEventListener('input', function() {
            updateColorFromRGB();
        });
    }

    function updateColorFromHex(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        colorPicker.querySelector('#redSlider').value = r;
        colorPicker.querySelector('#greenSlider').value = g;
        colorPicker.querySelector('#blueSlider').value = b;
        
        colorPicker.querySelector('#redValue').textContent = r;
        colorPicker.querySelector('#greenValue').textContent = g;
        colorPicker.querySelector('#blueValue').textContent = b;
    }

    function updateColorFromRGB() {
        const r = parseInt(colorPicker.querySelector('#redSlider').value);
        const g = parseInt(colorPicker.querySelector('#greenSlider').value);
        const b = parseInt(colorPicker.querySelector('#blueSlider').value);
        
        currentColor = rgbToHex(r, g, b);
        colorPicker.querySelector('#colorWheel').value = currentColor;
        
        colorPicker.querySelector('#redValue').textContent = r;
        colorPicker.querySelector('#greenValue').textContent = g;
        colorPicker.querySelector('#blueValue').textContent = b;
        
        updateColorDisplay();
    }

    function updateColorDisplay() {
        const r = parseInt(colorPicker.querySelector('#redSlider').value);
        const g = parseInt(colorPicker.querySelector('#greenSlider').value);
        const b = parseInt(colorPicker.querySelector('#blueSlider').value);
        
        colorPicker.querySelector('#currentColorBox').style.background = currentColor;
        colorPicker.querySelector('#hexValue').textContent = currentColor;
        colorPicker.querySelector('#rgbValue').textContent = `${r},${g},${b}`;
        
        if (ctx) {
            ctx.fillStyle = currentColor;
        }
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    window.setPresetColor = function(color) {
        currentColor = color;
        updateColorFromHex(color);
        updateColorDisplay();
    };

    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }

    function draw(e) {
        if (!isDrawing || !canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const pixelX = Math.floor(x / pixelSize) * pixelSize;
        const pixelY = Math.floor(y / pixelSize) * pixelSize;
        
        ctx.fillStyle = currentColor;
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
    }

    function stopDrawing() {
        isDrawing = false;
    }

    ext.showCanvas = function() {
        initCanvas();
        canvas.style.display = 'block';
    };

    ext.hideCanvas = function() {
        if (canvas) {
            canvas.style.display = 'none';
        }
    };

    ext.setColor = function(color) {
        currentColor = color;
        if (ctx) {
            ctx.fillStyle = color;
        }
        if (colorPicker && colorPicker.style.display !== 'none') {
            updateColorFromHex(color);
            updateColorDisplay();
        }
    };

    ext.setRGBColor = function(r, g, b) {
        r = Math.max(0, Math.min(255, Math.round(r)));
        g = Math.max(0, Math.min(255, Math.round(g)));
        b = Math.max(0, Math.min(255, Math.round(b)));
        
        currentColor = rgbToHex(r, g, b);
        if (ctx) {
            ctx.fillStyle = currentColor;
        }
        if (colorPicker && colorPicker.style.display !== 'none') {
            updateColorFromRGB();
        }
    };

    ext.setPixelSize = function(size) {
        pixelSize = Math.max(1, Math.min(50, size));
    };

    ext.clearCanvas = function() {
        if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            ctx.fillStyle = currentColor;
        }
    };

    ext.fillCanvas = function(color) {
        if (ctx) {
            const tempColor = ctx.fillStyle;
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            ctx.fillStyle = tempColor;
        }
    };

    ext.drawPixel = function(x, y) {
        if (ctx) {
            const pixelX = Math.floor(x / pixelSize) * pixelSize;
            const pixelY = Math.floor(y / pixelSize) * pixelSize;
            ctx.fillStyle = currentColor;
            ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        }
    };

    ext.drawLine = function(x1, y1, x2, y2) {
        if (!ctx) return;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = pixelSize;
        ctx.stroke();
    };

    ext.drawRect = function(x, y, width, height) {
        if (ctx) {
            ctx.fillStyle = currentColor;
            ctx.fillRect(x, y, width, height);
        }
    };

    ext.drawCircle = function(x, y, radius) {
        if (!ctx) return;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = currentColor;
        ctx.fill();
    };

    ext.getCurrentColor = function() {
        return currentColor;
    };

    ext.getRed = function() {
        return parseInt(currentColor.slice(1, 3), 16);
    };

    ext.getGreen = function() {
        return parseInt(currentColor.slice(3, 5), 16);
    };

    ext.getBlue = function() {
        return parseInt(currentColor.slice(5, 7), 16);
    };

    ext.showColorPicker = function() {
        createColorPicker();
        colorPicker.style.display = 'block';
        updateColorFromHex(currentColor);
        updateColorDisplay();
    };

    ext.hideColorPicker = function() {
        if (colorPicker) {
            colorPicker.style.display = 'none';
        }
    };

    ext.saveAsImage = function() {
        if (!canvas) return;
        
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'pixel-art.png';
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.log('Ошибка сохранения:', error);
        }
    };

    ext.generateRandomArt = function() {
        if (!ctx) return;
        
        ext.clearCanvas();
        
        for (let i = 0; i < 200; i++) {
            const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
            const x = Math.floor(Math.random() * (canvasSize / pixelSize)) * pixelSize;
            const y = Math.floor(Math.random() * (canvasSize / pixelSize)) * pixelSize;
            
            ctx.fillStyle = randomColor;
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
        
        ctx.fillStyle = currentColor;
    };

    ScratchExtensions.register('Pixel Artist Pro', descriptor, ext);
})({});
