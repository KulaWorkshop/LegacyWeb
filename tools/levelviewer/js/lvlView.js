var hexInput;
var hexArray = [];

let tile, fire, acid, invisible, camera, controls, scene, renderer;

var fileInput = document.getElementById("browseOpen");
fileInput.onchange = function () {            
    var fr = new FileReader();
    fr.onloadend = function () {
        var result = this.result;
        var hex = "";
        for (var i = 0; i < this.result.length; i++) {
            var byteStr = result.charCodeAt(i).toString(16);
            if (byteStr.length < 2) {
                byteStr = "0" + byteStr;
            }
            hex += byteStr;
        }
        hexInput = hex.toUpperCase();
    };
    fr.readAsBinaryString(this.files[0]);
};

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set( 400, 200, 0 );

controls = new OrbitControls( camera, renderer.domElement );
controls.listenToKeyEvents( window ); // optional


const geometry = new THREE.BoxBufferGeometry();
const hiroLoader = new THREE.TextureLoader();
const hillsLoader = new THREE.TextureLoader();
const otherLoader = new THREE.TextureLoader();
hiroLoader.setPath('textures/hiro/');
otherLoader.setPath('textures/other/');
hillsLoader.setPath('textures/hills/');

let hiroTextures = [];
hiroTextures[0] = hiroLoader.load('tile.png');
hiroTextures[1] = hiroLoader.load('fire.png');
hiroTextures[2] = hiroLoader.load('frozen.png');
hiroTextures[3] = hiroLoader.load('invisible.png');
hiroTextures[4] = hiroLoader.load('acid.png');

const hillsTileTexture = hillsLoader.load('tile.png');
const uknwnTexture = otherLoader.load('uknwn.png');

var setWorld = function (world) {
    switch (world) {
        case 0:
            tile = new THREE.MeshBasicMaterial({
                map: hiroTextures[0]
            });
            fire = new THREE.MeshBasicMaterial({
                map: hiroTextures[1]
            });
            frozen = new THREE.MeshBasicMaterial({
                map: hiroTextures[2]
            });
            invisible = new THREE.MeshBasicMaterial({
                map: hiroTextures[3],
                opacity: 0.5,
                transparent: true
            });
            acid = new THREE.MeshBasicMaterial({
                map: hiroTextures[4]
            });
            break;
        case 1:
            tile = new THREE.MeshBasicMaterial({
                map: hillsTileTexture
            });
            fire = new THREE.MeshBasicMaterial({
                map: hillsTileTexture
            });
            frozen = new THREE.MeshBasicMaterial({
                map: hillsTileTexture
            });
            invisible = new THREE.MeshBasicMaterial({
                map: hillsTileTexture,
                opacity: 0.5,
                transparent: true
            });
            acid = new THREE.MeshBasicMaterial({
                map: hillsTileTexture
            });
            break;
    }

}

setWorld(0);

var uknwn = new THREE.MeshBasicMaterial({
    map: uknwnTexture
});

document.getElementById("myBar").style.display = "none";


var cube = [];

var blocksLoaded1;

var loadLvlData = function () {
    hexArray = [];

    for (let i = 0; i < 39304; i++) {
        try {
            hexArray[i] = hexInput.substring((i * 4), ((i * 4) + 4));
        } catch {}
    }

    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    blocksLoaded1 = 0;    
        
    document.getElementById("myBar").style.width = (blocksLoaded1 * 0.002544270303277) + "%";
        
    document.getElementById("myBar").style.display = "block";

    cube = [];

    var yi = 0;
    var xi = 0;
    var zi = 0;
    var atBlock = 0;

    while (zi < 34) {
        while (xi < 34) {
            while (yi < 34) {
                switch (hexArray[atBlock]) {
                    case "FFFF":cube[atBlock] = "";break;                               //Air
                    case "0000":cube[atBlock] = new THREE.Mesh(geometry, tile);break;   //Basic Tile
                    case "0100":cube[atBlock] = new THREE.Mesh(geometry, fire);break;   //Fire Tile
                    case "0200":cube[atBlock] = new THREE.Mesh(geometry, frozen);break;   //Ice Tile
                    case "0300":cube[atBlock] = new THREE.Mesh(geometry, invisible);break;   //Invisible Tile
                    case "0400":cube[atBlock] = new THREE.Mesh(geometry, acid);break;   //Acid Tile
                    default: //Unknown
                        cube[atBlock] = new THREE.Mesh(geometry, uknwn);
                        //cube[atBlock] = "";
                        console.log("Unknown Block Value: " + hexArray[atBlock])
                        break;
                }

                try {
                    cube[atBlock].position.y = -(yi);
                    cube[atBlock].position.x = -(xi);
                    cube[atBlock].position.z = zi;

                    scene.add(cube[atBlock]);
                    
                    blocksLoaded1++;
                    
                    document.getElementById("myBar").style.width = (blocksLoaded1 * 0.002544270303277) + "%";
                } catch {}
                yi++;
                atBlock++;
            }
            yi = 0;
            xi++;
        }
        xi = 0;
        zi++;
    }
    document.getElementById("myBar").style.display = "none";
}

document.getElementById('loadHexLvl').onclick = function () {
    loadLvlData();
}

document.getElementById('loadWrld').onclick = function(){
    setWorld(document.getElementById('wrldSelect').value)
    loadLvlData();
}

document.getElementById('loadPreLvl').onclick = function () {
    hexInput = preDefLvls[parseInt(document.getElementById('preSelect').value)];
    loadLvlData();
}

var resetCamera = function () {
    camera.position.z = 40;
    camera.position.y = -17;
    camera.position.x = -17;
    camera.rotation.y = 0;
}

resetCamera();

document.getElementById('rstCam').onclick = function () {
    resetCamera();
}

scene.background = new THREE.Color(0x4d76ff);

var direction = new THREE.Vector3();

var tickRate = 30,
    keyDown = {},
    keyMap = {
        37: 'left',
        87: 'w',
        39: 'right',
        83: 's',
        38: 'up',
        40: 'down'
    };

$('body').keydown(function (e) {
    keyDown[keyMap[e.which]] = true;
});
$('body').keyup(function (e) {
    keyDown[keyMap[e.which]] = false;
});

var tick = function () {
    if (keyDown['w']) {
        camera.position.add(direction);
    } else if (keyDown['s']) {
        camera.position.sub(direction);
    } else if (keyDown['left']) {
        camera.rotation.y += 0.05;
    } else if (keyDown['right']) {
        camera.rotation.y -= 0.05;
    } else if (keyDown['up']) {
        camera.position.y += 1;
    } else if (keyDown['down']) {
        camera.position.y -= 1;
    }

    // other code

    setTimeout(tick, tickRate);
};

tick();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

const animate = function () {
    requestAnimationFrame(animate);

    camera.getWorldDirection(direction);
    renderer.render(scene, camera);
};

animate();
