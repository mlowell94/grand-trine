import './style.css'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const nebula = document.getElementById('nebula')
const nc = nebula.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight
nebula.width = innerWidth
nebula.height = innerHeight

const img = new Image();
img.src = "nebula.png"
const drawImg = () => {
    const imgRatio = img.height  / img.width
    const height = window.innerWidth * imgRatio
    nc.drawImage(img, 0, (window.innerHeight - height) / 2, window.innerWidth, height)
}
img.addEventListener('load', () => {
    drawImg()
}, false)



window.addEventListener('resize', () => {
    nc.reset()
    canvas.width = innerWidth
    canvas.height = innerHeight
    nebula.width = innerWidth
    nebula.height = innerHeight
})

const colors = ['#FFFFFF', '#0C1821', '#1B2A41', '#324A5F', '#CCC9DC']

class Node {
    constructor(data) {
        this.data = data;
        this.before = null;
        this.after = null
    }
}

class Queue {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
        this.maxLength = Math.floor(Math.random() * 12 + 2);
    }

    enqueue(node) {
        const newNode = new Node({x: node.x, y: node.y, radius: node.radius});
        if (this.head === null && this.tail === null) { // if both are null this is the first node to be added
            this.head = newNode;
            this.tail = newNode
            this.length += 1;
        } else { // if not, then this is not the first node to be added
            if (this.length === this.maxLength) { // if we've reached maximum capacity
                this.dequeue() // remove something before adding another
            }
            this.tail.after = newNode // set the node after the tail to be the new node
            newNode.before = this.tail // set the node that came before the new node to be the tail
            this.tail = newNode // the new tail is the new node
            this.length += 1;
        }
    }

    dequeue() {
        this.head = this.head.after
        this.head.before = null;
        this.length -= 1;
    }
}

function pointInTriangle(point, vertex1, vertex2, vertex3) {
    const [x, y] = point;
    const [x1, y1] = vertex1;
    const [x2, y2] = vertex2;
    const [x3, y3] = vertex3;
  
    const denominator = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
    const u = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
    const v = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
    const w = 1 - u - v;
  
    return u >= 0 && v >= 0 && w >= 0;
  }

class Triangle {
    constructor(startingPoint) {
        this.a = { x: startingPoint.x, y: startingPoint.y, radians: 10.476143473464265 }
        this.b = { x: this.a.x + 100, y: this.a.y + 100, radians: 5.7842474559413737}
        this.c = { x: this.b.x - 200, y: this.b.y, radians: 4.013302743504613}
        this.velocity = {
            a: {x: .0125, y: .0125},
            b: {x: -.0125, y: .0125},
            c: {x: .0125, y: -.0125},
        }
    }
    draw() {
        c.beginPath();
        c.moveTo(this.a.x, this.a.y)
        c.lineTo(this.b.x, this.b.y)
        c.lineTo(this.c.x, this.c.y)
        c.lineTo(this.a.x, this.a.y)
        c.fillStyle = 'black'
        c.fill();
        c.strokeStyle = '#FFFFFF80'
        c.stroke();
        
        nc.reset();
        nc.beginPath();
        nc.moveTo(this.a.x, this.a.y)
        nc.lineTo(this.b.x, this.b.y)
        nc.lineTo(this.c.x, this.c.y)
        nc.lineTo(this.a.x, this.a.y)
        nc.clip();
        drawImg();
    }
    update() {
        this.a.radians += this.velocity.a.x
        this.b.radians += this.velocity.b.x
        this.c.radians += this.velocity.b.x
        // canvas.width / 2 sets the rotational center to be middle of the screen, 
        // Math.cos(this.a.radians) sets the rotation direction, 
        // and * canvas.width / 4 distances the point from the middle,
        this.a.x = canvas.width / 2 + Math.cos(this.a.radians + .75) * canvas.width / 3
        this.a.y = canvas.height / 2 + Math.sin(this.a.radians) * canvas.height / 2
        this.b.x = canvas.width / 2 + Math.cos(this.b.radians) * canvas.width / 3 
        this.b.y = canvas.height / 2 + Math.sin(this.b.radians) * canvas.height / 2
        this.c.x = canvas.width / 2 + Math.cos(this.c.radians) * canvas.width / 3 
        this.c.y = canvas.height / 2 + Math.sin(this.c.radians) * canvas.height / 2
        this.draw();
    }
}

const genRatio = (x, y) => {
    const dx = (canvas.width / 2 - x) 
    const dy = (canvas.height / 2 - y)
    if (x > canvas.width / 2 && y > canvas.height / 2) {
        return (dx / dy)
    }
    if (x > canvas.width / 2 || y > canvas.height / 2) {        
        return (dx / dy) *  -1;
    }
    return (dx / dy)
}

class Star {
    constructor(x, y, mobile) {
        this.x = x;
        this.y = y;
        this.color = 'transparent'
        this.activeColor = colors[Math.floor(Math.random() * 5 + 1)]
        this.mobile = mobile ? true : false;
        this.radius = Math.random() * 1 + 1
        this.centered = false
        this.slope = ((canvas.height / 2 - y) / (canvas.width / 2 - x))
        this.velocity = {x: genRatio(this.x, this.y), y: 1}
        this.oldPositions = new Queue();
    }
    draw() {
        if (this.mobile) {
            this.oldPositions.enqueue({x: this.x, y: this.y, radius: this.radius})
        }
        if (this.oldPositions.length > 0) {
            let current = this.oldPositions.tail
            while (current.before !== null) {
                if(pointInTriangle([current.data.x, current.data.y], [triangle.a.x, triangle.a.y], [triangle.b.x, triangle.b.y], [triangle.c.x, triangle.c.y])) {
                    this.color = this.activeColor
                } else {
                    this.color = 'transparent'
                }
                c.beginPath();
                c.arc(current.data.x, current.data.y, current.data.radius, 0, Math.PI * 2, false)
                c.fillStyle = this.color
                c.fill()
                c.strokeStyle = this.color;
                c.stroke();
                current = current.before
            }
        }
        if(pointInTriangle([this.x, this.y], [triangle.a.x, triangle.a.y], [triangle.b.x, triangle.b.y], [triangle.c.x, triangle.c.y])) {
            this.color = this.activeColor
        } else {
            this.color = 'transparent'
        }
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.strokeStyle = this.color;
        c.stroke();
    }
    update() {
        if (this.mobile) {
            if (this.radius - .025 < 0) {
                this.centered = true;
            } else {
                this.radius = this.radius - .025
            }
            if (this.x - this.velocity.x > canvas.width / 2 - .25 ) {
                this.x -= this.velocity.x;
            } else if (this.x + this.velocity.x < canvas.width / 2 + .25) {
                this.x += this.velocity.x;
            } else {
                this.centered = true
            }
            if (this.y -  this.velocity.y > canvas.height / 2 + .25) {
                this.y -= this.velocity.y;
            } else if (this.y + this.velocity.y < canvas.height / 2 - .25) {
                this.y += this.velocity.y;
            } else {
                this.centered = true
            }
        }
        this.draw()
    }
}

const triangle = new Triangle(canvas.width / 2, canvas.height / 2)

let stars = [];
for (let i = 0; i < 100; i += 1) {
    const x = (Math.random() * canvas.width / 2) + canvas.width / 4;
    const y = Math.random() * canvas.height;
    const mobile = Math.floor(Math.random() * 2)
    stars.push(new Star(x, y, mobile))
}


function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
        triangle.update();
        if (stars.length <= 0) {
            c.moveTo(10, 10)
            c.lineTo(20, 20)
            c.stroke();
        }
        c.save()
        for (let i = 0; i < stars.length; i += 1) {
            stars[i].update()
            if (stars[i].centered) {
                stars = stars.slice(0, i).concat(stars.slice(i+1))
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                stars.push(new Star(x, y, true))
            }
        }
        c.restore();
}

animate();