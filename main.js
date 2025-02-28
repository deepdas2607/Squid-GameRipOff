//Setup 3-js scene,camera, and renderer
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )

//Setup Lighting using ambient light and directionallight frm 3.js
const light = new THREE.AmbientLight( 0xffffff )
scene.add( light )

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
directionalLight.castShadow = true
scene.add( directionalLight )
directionalLight.position.set( 0, 1, 1 )

//Adjusting Scene Camera Position and Color 
camera.position.z = 5
renderer.setClearColor( 0xB7C3F3, 1 )

//Object Creation to load 3D model of DOLL
const loader = new THREE.GLTFLoader()
let doll

//runway start cube and end cube position
const start_position = 6
const end_position = -start_position

//will display all the things in .text like all player safe, everyone is out,etc.
const text = document.querySelector('.text')

let DEAD_PLAYERS = 0
let SAFE_PLAYERS = 0

//Will display all the things related to .start-btn
const startBtn = document.querySelector('.start-btn')

//Music and Music controls
const bgMusic = new Audio('./music/bg.mp3')
bgMusic.loop = true
const winMusic = new Audio('./music/win.mp3')
const loseMusic = new Audio('./music/lose.mp3')

//Code from documentation to load gltf models (model taken from sketchfab)
loader.load( './model/scene.gltf', function ( gltf ){
    scene.add( gltf.scene )
    doll = gltf.scene
    gltf.scene.position.set(0,-1.7, 0)
    gltf.scene.scale.set(0.4, 0.4, 0.4)
    startBtn.innerText = "start"
})

//Doll look back and front using gsap animation
function lookBackward(){
    gsap.to(doll.rotation, {duration: .45, y: -3.15})
    setTimeout(() => dollFacingBack = true, 150)
}
function lookForward(){
    gsap.to(doll.rotation, {duration: .45, y: 0})
    setTimeout(() => dollFacingBack = false, 450)
}

//Creating a cube function to be called to make RUNWAY
function createCube(size, posX, rotY = 0, color = 0xfbc851){
    const geometry = new THREE.BoxGeometry( size.w, size.h, size.d )
    const material = new THREE.MeshBasicMaterial( { color } )
    const cube = new THREE.Mesh( geometry, material )
    cube.position.set(posX, 0, 0)
    cube.rotation.y = rotY
    scene.add( cube )
    return cube
}

//Creating RUNWAY
createCube({w: start_position * 2 + .21, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z = -1
createCube({w: .2, h: 1.5, d: 1}, start_position, -.4)
createCube({w: .2, h: 1.5, d: 1}, end_position, .4)

//Defining Player Logic (Player is a SPHERE using 3.js)
class Player {
    constructor(name = "Player", radius = .25, posY = 0, color = 0xffffff){
        const geometry = new THREE.SphereGeometry( radius, 100, 100 )
        const material = new THREE.MeshBasicMaterial( { color } )
        const player = new THREE.Mesh( geometry, material )
        scene.add( player )
        player.position.x = start_position - .4
        player.position.z = 1
        player.position.y = posY
        this.player = player
        this.playerInfo = {
            positionX: start_position - .4,
            velocity: 0,
            name,
            isDead: false
        }
    }
//This method is when the user presses a key and the player has to Run
    run(){
        if(this.playerInfo.isDead) return
        this.playerInfo.velocity = .03
    }
//This method is when the user leaves a key and the player has to Stop
    stop(){
        gsap.to(this.playerInfo, { duration: .1, velocity: 0 })
    }

//Conditions to check the player status
    check(){
        if(this.playerInfo.isDead) return
        if(!dollFacingBack && this.playerInfo.velocity > 0){
            text.innerText = this.playerInfo.name + " lost!!!"
            this.playerInfo.isDead = true
            this.stop()
            DEAD_PLAYERS++
            loseMusic.play()
            if(DEAD_PLAYERS == players.length){
                text.innerText = "All Died"
                gameStat = "ended"
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameStat = "ended"
            }
        }
        if(this.playerInfo.positionX < end_position + .7){
            text.innerText = this.playerInfo.name + " is safe!!!"
            this.playerInfo.isDead = true
            this.stop()
            SAFE_PLAYERS++
            winMusic.play()
            if(SAFE_PLAYERS == players.length){
                text.innerText = "All Safe"
                gameStat = "ended"
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameStat = "ended"
            }
        }
    }

//This is called to check on the players position and velocity time to time
    update(){
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity
        this.player.position.x = this.playerInfo.positionX
    }
}

async function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

//2 player definition
const player1 = new Player("P1", .25, .3, 0xD1FFC6)
const player2 = new Player("P2", .25, -.3, 0xFFCFD2)

//Assigning Key Bindings using Key:Value
const players = [
    {
        player: player1,
        key: "ArrowUp",
        name: "P1"
    },
    {
        player: player2,
        key: "w",
        name: "P2"
    }
]

//Code to display game start message
const TIME_LIMIT = 20
async function init(){
    await delay(500)
    text.innerText = "Starts in 3"
    await delay(500)
    text.innerText = "Starts in 2"
    await delay(500)
    text.innerText = "Starts in 1"
    lookBackward()
    await delay(500)
    text.innerText = "Run !!"
    bgMusic.play()
    start()
}

let gameStat = "loading"

//function to tell the player if he ran out of time or the game ended somehow
function start(){
    gameStat = "started"
    const progressBar = createCube({w: 8, h: .3, d: 1}, 0, 0, 0xebaa12)
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale, {duration: TIME_LIMIT, x: 0, ease: "none"})
    setTimeout(() => {
        if(gameStat != "ended"){
            text.innerText = "Time Up"
            loseMusic.play()
            gameStat = "ended"
        }
    }, TIME_LIMIT * 1000)
    startdoll()
}

//function to make the doll move at random time intervals
let dollFacingBack = true
async function startdoll(){
   lookBackward()
   await delay((Math.random() * 1500) + 1500)
   lookForward()
   await delay((Math.random() * 750) + 750)
   startdoll()
}

//adding event listeners that will start the game process on clicking start button
startBtn.addEventListener('click', () => {
    if(startBtn.innerText == "START"){
        init()
        document.querySelector('.modal').style.display = "none"
    }
})

//function to animate and render the scene on each refresh or time interval
function animate(){
    renderer.render( scene, camera )
    players.map(player => player.player.update())
    if(gameStat == "ended") return
    requestAnimationFrame( animate )
}
animate()

//Window Event Listener Keyboard
window.addEventListener( "keydown", function(e){
    if(gameStat != "started") return
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.run()
    }
})
window.addEventListener( "keyup", function(e){
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.stop()
    }
})

//Window Resize Handler
window.addEventListener( 'resize', onWindowResize, false )
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
}