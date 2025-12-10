let handPose;
let video;
let hands = [];
let planets = [];
let prevX = null;
let prevY = null;
let planetImg;

function preload() {
  handPose = ml5.handPose();
  planetImg = loadImage('image/place5.png');
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  handPose.detectStart(video, gotHands);
}

function draw() {
  // Space background
  background(5, 5, 25);
  
  // Twinkling stars
  for (let i = 0; i < 100; i++) {
    noStroke();
    fill(255, 255, 255, random(50, 200));
    circle(random(width), random(height), random(1, 2));
  }
  
  image(video, 0, 0, width, height);
  
  let fingerX = width / 2;
  let fingerY = height / 2;
  let isHandDetected = false;
  
  if (hands.length > 0) {
    let finger = hands[0].index_finger_tip;
    let thumb = hands[0].thumb_tip;
    let pinchDist = dist(finger.x, finger.y, thumb.x, thumb.y);
    
    fingerX = finger.x;
    fingerY = finger.y;
    isHandDetected = true;
    
    // Pinch to create new planet
    if (pinchDist < 40) {
      if (prevX === null || dist(fingerX, fingerY, prevX, prevY) > 50) {
        planets.push(new Planet(fingerX, fingerY));
        prevX = fingerX;
        prevY = fingerY;
      }
      
      // Show "creating" cursor
      noStroke();
      fill(255, 200, 100, 200);
      circle(fingerX, fingerY, 25);
      fill(255, 255, 255, 150);
      circle(fingerX, fingerY, 15);
      
    } else {
      prevX = null;
      prevY = null;
      
      // Show normal cursor
      noStroke();
      fill(100, 200, 255, 150);
      circle(fingerX, fingerY, 20);
    }
  }
  
  // Update and display all planets
  for (let i = planets.length - 1; i >= 0; i--) {
    if (isHandDetected) {
      planets[i].orbit(fingerX, fingerY);
    }
    planets[i].update();
    planets[i].display();
    
    // Remove planets that are too old
    if (planets[i].age > 500) {
      planets.splice(i, 1);
    }
  }
  
  // Instructions
  fill(255);
  noStroke();
  textSize(18);
  textAlign(LEFT);
  text("🪐 Planet Playground", 10, 25);
  textSize(14);
  text("Pinch to create planets!", 10, 50);
  text("Planets orbit around your finger", 10, 70);
  text("Planets: " + planets.length, 10, height - 10);
}

class Planet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // Preserve original image aspect ratio
    this.aspectRatio = planetImg.width / planetImg.height;
    
    // Start small and expand to target size
    this.startSize = 30;
    this.targetSize = random(150, 250);
    this.currentSize = this.startSize;
    this.growthRate = random(0.5, 1.5);
    
    this.angle = random(TWO_PI);
    this.orbitRadius = random(60, 150);
    this.orbitSpeed = random(0.02, 0.05);
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.02, 0.02);
    this.age = 0;
    this.opacity = 255;
  }
  
  get width() {
    return this.currentSize * this.aspectRatio;
  }
  
  get height() {
    return this.currentSize;
  }
  
  orbit(centerX, centerY) {
    this.angle += this.orbitSpeed;
    let targetX = centerX + cos(this.angle) * this.orbitRadius;
    let targetY = centerY + sin(this.angle) * this.orbitRadius;
    
    // Smooth movement toward orbit position
    this.x += (targetX - this.x) * 0.1;
    this.y += (targetY - this.y) * 0.1;
  }
  
  update() {
    this.age++;
    this.rotation += this.rotationSpeed;
    
    // Expand size gradually toward target
    if (this.currentSize < this.targetSize) {
      this.currentSize += this.growthRate;
      if (this.currentSize > this.targetSize) {
        this.currentSize = this.targetSize;
      }
    }
    
    // Gentle floating when no hand
    this.x += random(-0.5, 0.5);
    this.y += random(-0.5, 0.5);
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    // Add a glow effect behind the image
    tint(255, 255, 255, 80);
    image(planetImg, 0, 0, this.width + 20, this.height + 20);
    
    // Draw the main image with preserved aspect ratio
    tint(255, 255, 255, this.opacity);
    imageMode(CENTER);
    image(planetImg, 0, 0, this.width, this.height);
    
    pop();
  }
}

function gotHands(results) {
  hands = results;
}

function keyPressed() {
  if (key === 'c' || key === 'C') {
    planets = [];
  }
}