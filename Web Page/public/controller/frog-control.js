angular.module('animalid')
  .controller('frogControl', function($scope, mainService) {

$scope.showClasses = false
$scope.showAnimalList = false
$scope.showAnimal = false

$scope.classes = function(subclass){
mainService.getSubclass(subclass)
.then(function(response, err){
console.log(response);
if(err){
    console.log('API FAIL')
} else {
    $scope.subclasses = response;
    $scope.showClasses = true
    $scope.showAnimalList = false
    $scope.showAnimal = false
}
    })
};

$scope.animals = function(animals){
mainService.getAllAnimals(animals)
.then(function(response, err){
console.log(response);
if(err){
    console.log('API FAIL')
} else {
    $scope.animalList = response;
    console.log($scope.animallist)
    $scope.showClasses = false
    $scope.showAnimalList = true
    $scope.showAnimal = false
}
    })
};

$scope.animalData = function(data){
mainService.getAnimalData(data)
.then(function(response, err){
console.log(response);
if(err){
    console.log('API FAIL')
} else {
    $scope.animalData = response;
    console.log($scope.animalData)
    $scope.showClasses = false
    $scope.showAnimalList = false
    $scope.showAnimal = true
}
    })
};



var a = document.getElementById( 'flies' ),
	c = a.getContext( '2d' );

var chains = [],
	chainCount = 5,
	entityCount = 2,
	w = a.width,
	h = a.height,
	md = 0,
	tick = 0,
	maxa = 2,
	maxv = 10,
	avoidTick = 20,
	avoidThresh = 50,
	TWO_PI = Math.PI * 2;

function rand( min, max ) {
	return Math.random() * ( max - min ) + min;
}

function Impulse() {
	this.x = cx;
	this.y = cy;
	this.ax = 0;
	this.ay = 0;
	this.vx = 0;
	this.vy = 0;
	this.r = 1;
}

Impulse.prototype.step = function() {
	this.x += this.vx;
	this.y += this.vy;
	if( this.x + this.r >= w || this.x <= this.r ) { this.vx = 0; this.ax = 0; }
	if( this.y + this.r >= h || this.y <= this.r ) { this.vy = 0; this.ay = 0; }
	if( this.x + this.r >= w ) { this.x = w - this.r; }
	if( this.x <= this.r ) { this.x = this.r; }
	if( this.y + this.r >= h ) { this.y = h - this.r; }
	if( this.y <= this.r ) { this.y = this.r; }

	if( md ) {
		this.vx += ( mx - this.x ) * 0.03;
		this.vy += ( my - this.y ) * 0.03;
	}
	
	this.ax += rand( -0.4, 0.4 );
	this.ay += rand( -0.4, 0.4 );
	this.vx += this.ax;
	this.vy += this.ay;
	this.ax *= Math.abs( this.ax ) > maxa ? 0.75 : 1;
	this.ay *= Math.abs( this.ay ) > maxa ? 0.75 : 1;
	this.vx *= Math.abs( this.vx ) > maxv ? 0.75 : 1;
	this.vy *= Math.abs( this.vy ) > maxv ? 0.75 : 1;
};

function Chain() {
	this.branches = [];
	this.impulse = new Impulse();
	this.branches.push( new Branch({
		chain: this,
		attractor: this.impulse
	}));
}

Chain.prototype.step = function() {
	this.impulse.step();
	this.branches.forEach( function( branch, i ) {
		branch.step();
	});

	this.branches.forEach( function( branch, i ) {
		branch.draw();
	});
};

function Branch( opt ) {
	this.entities = [];
	this.chain = opt.chain;
	this.avoiding = 0;
	var entity;
	for( var i = 0; i < entityCount; i++ ) {
		entity = new Entity({
			branch: this,
			i: i,
			x: cx,
			y: cy,
			radius: 1 + ( entityCount - i ) / entityCount * 2,
			damp: 0.2,
			attractor: i === 0 ? opt.attractor : this.entities[ i - 1 ]
		});
		this.entities.push( entity );
	}
}

Branch.prototype.step = function() {
	var i = chains.length;
	while( i-- ) {
		var impulse = this.chain.impulse,
			oImpulse = chains[ i ].impulse,
			dx = oImpulse.x - impulse.x,
			dy = oImpulse.y - impulse.y,
			dist = Math.sqrt( dx * dx + dy * dy );
		if( !md && impulse !== oImpulse && dist < avoidThresh ) {
			impulse.ax = 0;
			impulse.ay = 0;
			impulse.vx -= dx * 0.1;
			impulse.vy -= dy * 0.1;
			this.avoiding = avoidTick;
		}
	}

	this.entities.forEach( function( entity, i ) {
		entity.step();
	});

	if( this.avoiding > 0 ) {
		this.avoiding--;
	}
};

Branch.prototype.draw = function() {
	var self = this;
	c.beginPath();
	c.moveTo( this.entities[ 0 ].x, this.entities[ 0 ].y );
	this.entities.forEach( function( entity, i ) {
		if( i > 0 ) {
			c.lineTo( entity.x, entity.y );
		}
	});
	

	this.entities.forEach( function( entity, i ) {
		c.save();
		c.translate( entity.x, entity.y );
		c.beginPath();
		c.rotate( entity.rot );
		if( entity.i === 0 ) {
			c.fillStyle = ( md ? '#000000' : ( self.avoiding ? '#000000' : '#000' ) );
		} else {
			c.fillStyle = 'hsla(' + ( md ? 120 : ( self.avoiding ? 0 : 200 ) ) + ', 70%, ' + Math.min( 50, ( 5 + ( ( entity.av / maxv ) * 20 ) ) ) + '%, ' + ( ( ( entityCount - i ) / entityCount ) ) + ')';
		}
		c.fillRect( -entity.radius, -entity.radius, entity.radius * 2, entity.radius * 2 );
		c.restore();
	});

};

function Entity( opt ) {
	this.branch = opt.branch;
	this.i = opt.i;
	this.x = opt.x;
	this.y = opt.y;
	this.vx = 0;
	this.vy = 0;
	this.radius = opt.radius;
	this.attractor = opt.attractor;
	this.damp = opt.damp;
}

Entity.prototype.step = function() {
	this.vx = ( this.attractor.x - this.x ) * this.damp;
	this.vy = ( this.attractor.y - this.y ) * this.damp;
	this.x += this.vx;
	this.y += this.vy;
	this.av = ( Math.abs( this.vx ) + Math.abs( this.vy ) ) / 2;

	var dx = this.attractor.x - this.x,
		dy = this.attractor.y - this.y;
	this.rot = Math.atan2( dy, dx );
};

function loop() {
	requestAnimationFrame( loop );

	c.globalCompositeOperation = 'destination-out';
	c.fillStyle = 'rgba(0, 0, 0, 1)';
	c.fillRect( 0, 0, a.width, a.height );
	c.globalCompositeOperation = 'lighter';

	chains.forEach( function( chain, i ) {
		chain.step();
	});

	tick++;
}

function resize() {
	a.width = window.innerWidth;
	a.height = window.innerHeight;
	w = a.width;
	h = a.height;
	cx = w / 2;
	cy = h / 2;
}

window.addEventListener( 'resize', resize );

window.addEventListener( 'mousedown', function() {
	md = 1;
});

window.addEventListener( 'mouseup', function() {
	md = 0;
});

window.addEventListener( 'mousemove', function( e ) {
	mx = e.clientX;
	my = e.clientY;
});

resize();

for( var i = 0; i < chainCount; i++ ) {
	chains.push( new Chain() );
}

loop();

});