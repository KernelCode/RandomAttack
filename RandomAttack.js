/*
	RandomAttack Game by Abdullah Altahery
	AbdullahAltahery@gmail.com
	Licensed under the MIT license - http://opensource.org/licenses/MIT
*/
var TanksAry=[];
var ShotsAry=[];
var NUM_DEAD=0;
var NUM_SHOTS=0;
function color(r,g,b,a){
	this.r=r;
	this.g=g;
	this.b=b;
	this.a=a;
	this.getString=function(){
		return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
	}
	this.opacity=function(opa){
		this.a=opa;
		return this;
	}
	this.convertToColor=function(str){
		temp="";
		rgba = [0,0,0,0];
		rgba_index=0;
		for(i=4;i<str.length;i++){
			if(str[i]=="," || str[i]=="]"){
				i++;
				rgba[rgba_index]=parseInt(temp);
				rgba_index++;
				temp="";
				continue;
			}

			temp+=str[i];
		}
		this.r=rgba[0];
		this.g=rgba[1];
		this.b=rgba[2];
		this.a=rgba[3];
		
	}
	
}
function playSound(name){
	var audio = new Audio(name+".mp3");
	audio.play();
}
function randNumber(max,min){
	return Math.floor((Math.random()*max))+min;
}
var mouseXY={mX:0,mY:0};
document.onmousemove  = function(e){
	mouseXY={mX:e.pageX,mY:e.pageY};
};

(function(){
	var gameCanvas=document.getElementById("game");
	var ctx=gameCanvas.getContext("2d");
	gameCanvas.width=window.innerWidth;
	gameCanvas.height=window.innerHeight;
	var fps = 34;
	var now;
	var then = Date.now();
	var interval = 1000/fps;
	var delta;
	var START_GAME=false;
	function draw_rec(x,y,color,sizeX,sizeY){
		ctx.fillStyle=color.getString();
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x+sizeX,y);
		ctx.lineTo(x+sizeX,y+sizeY);
		ctx.lineTo(x,y+sizeY);
		ctx.lineTo(x,y);
		ctx.closePath();
		ctx.fill();
	}
	function draw_cir(posX,posY,color,size){
		ctx.beginPath();
		ctx.fillStyle=color.getString();
		ctx.arc(posX,posY,size,0,2*Math.PI);
		ctx.fill();
	}
	function draw_cir_stork(posX,posY,color,size){
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle =color.getString();
		ctx.arc(posX,posY,size,0,2*Math.PI);
		ctx.stroke();
	}
	var time_started=[];
	function AfterSecs(secs,id,func){
			if(time_started[id]!=-1){
				if(typeof time_started[id] === "undefined"){
					time_started[id] = (new Date().getTime() / 1000)+secs;
				}else{
					if( (new Date().getTime()  / 1000) - time_started[id] > 0 ){
						func();
						time_started[id]=-1;
					}
				}
			}

			
	}
	function event(){
	this.is_mouse_in=0;
	this.is_mouseout=function(page,obj){
		if(this.is_mouse_in!=0){
			this.is_mouse_in=0;
			
			var RealPosX=obj.shape_pos.X/*-obj.shape_size.sizeX*/  ;
			var bX=obj.shape_pos.X+obj.shape_size.sizeX ;
			var bY=obj.shape_pos.Y+obj.shape_size.sizeY ;
			var RealPosY=obj.shape_pos.Y/*-obj.shape_size.sizeY*/  ;
			if(
				(page.mX < RealPosX || page.mX > bX) ||
				(page.mY < RealPosY || page.mY > bY)
			){
				
				return true;
			}
			
			
		}else{
			var RealPosX=obj.shape_pos.X/*-obj.shape_size.sizeX*/  ;
			var bX=obj.shape_pos.X+obj.shape_size.sizeX ;
			
			var bY=obj.shape_pos.Y+obj.shape_size.sizeY ;
			var RealPosY=obj.shape_pos.Y/*-obj.shape_size.sizeY*/  ;
			if(
				(page.mX < RealPosX || page.mX > bX) ||
				(page.mY < RealPosY || page.mY > bY)
			){
				
				this.is_mouse_in=0;
			}else{
				this.is_mouse_in=1;
			}
		}
		return false;
	}
	this.is_hover=function(page,obj){
		
		var bX=obj.shape_pos.X+obj.shape_size.sizeX ;
		var RealPosX=obj.shape_pos.X/*-obj.shape_size.sizeX*/ ;
		
		var bY=obj.shape_pos.Y+obj.shape_size.sizeY ;
		var RealPosY=obj.shape_pos.Y/*-obj.shape_size.sizeY*/ ;
		if(
			(page.mX > RealPosX && page.mX<bX) &&
			(page.mY > RealPosY && page.mY<bY)
		){
			this.is_mouse_in=1;
			return true;
		}
		return false;
	}
	this.type = [
		{
			name:"hover",
			callback:function(){}
		}, 
		{
			name: "mouseout",
			callback:function(){}
		}
	  
	];
	this.FireCallback=function(name,page,obj){
		for(i=0;i<this.type.length;i++){
			if(this.type[i].name==name){
				this.type[i].callback(page,obj);
				break;
			}
		}
	}
	this.addListner=function(type,func){
		for(i=0;i<this.type.length;i++){
			if(this.type[i].name==type){
				this.type[i].callback=func;
			}
		}
	}
}
	var shotObj=function(){
		this.damage=2;
		this.shape_pos={X:0,Y:0,XT:0,YT:0};
		this.shape_size={sizeX:0,sizeY:0};
		this.boxAccX=0;
		this.boxAccY=0;
		this.boxAccXm=0;
		this.boxAccYm=0;
		this.IsOutRang=false;
		this.boxColor=new color(200,200,200,0.6);
		this.drawShape=0;
		this.boxAccXz=0;
		this.WeaponType="normalShot",
		this.afterFinishAni=function(){};
		this.isFinshedAnimation=false;
		this.time_started=[];

		this.after=function(secs,id,func){
			if(typeof this.time_started[id] === "undefined"){
				this.time_started[id] = (new Date().getTime() / 1000)+secs;
			}else{
				if( (new Date().getTime()  / 1000) - this.time_started[id] > 0 ){
					func();
				}
			}
			
		}
		this.addAcc=function(accX,accY){
			if(this.boxAccX<10){
				this.boxAccX+=accX;
			}
			if(this.boxAccY<10){
				this.boxAccY+=accY;
			}
		}
		this.drawHolePos=function(){}
		this.setBox=function(obj){
			if( obj !== null && typeof obj === 'object'){
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						this[key]=obj[key];
					}
				}
				
			}
		}
		this.calcAcc=function(){
			
			if( this.boxAccY!=0 || this.boxAccX!=0){
				
				if(
						(this.boxAccY>=0.01 && this.boxAccY<=1) &&
						(this.boxAccX>=0.01 && this.boxAccX<=1) 
					){
					this.boxAccY=0;
					this.boxAccX=0;
					this.boxAccYm=0;
					this.boxAccXm=0;
					this.isFinshedAnimation=true;
					this.shape_pos.XT=this.shape_pos.X;
					this.shape_pos.YT=this.shape_pos.Y;
					return ;
				}
				if(
						(this.boxAccY>=-0.01 && this.boxAccY<=0.01) &&
						(this.boxAccX>=-0.01 && this.boxAccX<=0.01) 
					){
					this.boxAccY=0;
					this.boxAccX=0;
					this.boxAccYm=0;
					this.boxAccXm=0;
					this.isFinshedAnimation=true;
					this.shape_pos.XT=this.shape_pos.X;
					this.shape_pos.YT=this.shape_pos.Y;
					return ;
				}
			}else{
				return ;
			}

			this.shape_pos.X+=this.boxAccX;
			this.shape_pos.Y+=this.boxAccY;
			
			if(this.boxAccX>0)
				this.boxAccX-=this.boxAccXm;
			else{
				this.boxAccX+=this.boxAccXm;
			}
			if(this.boxAccY>0)
				this.boxAccY-=this.boxAccYm;
			else{
				this.boxAccY+=this.boxAccYm;
			}
			


		}
		this.draw=function(pageX,pageY,mXY){
			if(!this.IsOutRang){
				if(START_GAME){
					this.calcAcc();
				}
				if(
					(this.shape_pos.X>pageX || this.shape_pos.Y>pageY) ||
					(this.shape_pos.X<0 || this.shape_pos.Y<0)
					){
					this.IsOutRang=true;
					
				}else{
					if(this.isFinshedAnimation){
						
						this.afterFinishAni(this);
					}else{
						if(this.type=="box")
							draw_rec(this.shape_pos.X,this.shape_pos.Y,this.boxColor,this.shape_size.sizeX,this.shape_size.sizeY);
						else if (this.type=="cir")
							draw_cir(this.shape_pos.X,this.shape_pos.Y,this.boxColor,this.shape_size.sizeY);
					
					}

				}
			}
		}
	}
	var boxObj=function(){
		this.shape_pos={X:0,Y:0};
		this.shape_size={sizeX:0,sizeY:0};
		this.boxAccX=0;
		this.boxAccY=0;
		this.boxAccXm=0;
		this.boxAccYm=0;
		this.IsOutRang=false;
		this.boxColor=new color(200,200,200,0.6);
		this.drawShape=0;
		this.ShotStrong=3.2;
		this.Health=100;
		this.speed=3;
		this.weapon="normalShot";
		this.damage=1;
		this.type="box";
		this.ID="Tank";
		this.Shild=0;
		this.addAcc=function(accX,accY){

			if(this.boxAccX<10){
				this.boxAccX+=accX;
			}
			
			if(this.boxAccY<10){
				this.boxAccY+=accY;
			}
		}
		this.drawHolePos=function(){}
		this.setBox=function(obj){
			if( obj !== null && typeof obj === 'object'){
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						this[key]=obj[key];
					}
				}
			}
		}
		this.calcAcc=function(){
			if( this.boxAccY!=0 || this.boxAccX!=0){
				if(
						(this.boxAccY>=0.1 && this.boxAccY<=2) &&
						(this.boxAccX>=0.1 && this.boxAccX<=2) 
					){
					this.boxAccY=0;
					this.boxAccX=0;
					this.boxAccYm=0;
					this.boxAccXm=0;
				}else{
					this.shape_pos.X+=this.boxAccX;
					this.shape_pos.Y+=this.boxAccY;
					if(this.boxAccX>0)
						this.boxAccX-=this.boxAccXm;
					else{
						this.boxAccX+=this.boxAccXm;
					}
					if(this.boxAccY>0)
						this.boxAccY-=this.boxAccYm;
					else{
						this.boxAccY+=this.boxAccYm;
					}
				}				
			}
			if(this.shape_pos.Y>gameCanvas.height-40){
				this.shape_pos.Y=gameCanvas.height-40;
				this.boxAccY=0;
			}
			if(this.shape_pos.Y<100){
				this.shape_pos.Y=100;
				this.boxAccY=0;
			}
			if(this.shape_pos.X<10){
				this.shape_pos.X=10;
				this.boxAccX=0;
			}
			if(this.shape_pos.X>gameCanvas.width-40){
				this.shape_pos.X=gameCanvas.width-40;
				this.boxAccX=0;
			}
		}
		this.draw=function(pageX,pageY,mXY){
			if(this.Health>0){
				if(START_GAME){
					this.calcAcc();
				}
				
				this.process_events(this,mXY);
				if(this.shape_pos.X>pageX || this.shape_pos.Y>pageY)
					this.IsOutRang=true;
				else{

					if(this.drawShape==0){
						if(this.type=="box")
							draw_rec(this.shape_pos.X,this.shape_pos.Y,this.boxColor,this.shape_size.sizeX,this.shape_size.sizeY);
						else if (this.type=="cir")
							draw_cir(this.shape_pos.X,this.shape_pos.Y,this.boxColor,this.shape_size.sizeY);
					}else{
						this.drawShape({X:this.shape_pos.X,Y:this.shape_pos.Y});
					}


				}
			}
		}
		this.events=new event();
		this.process_events=function(s,page){
			if(s.events.is_mouseout(page,s)){
				s.events.FireCallback("mouseout",page,s);
			}
			if(s.events.is_hover(page,s)){
				s.events.FireCallback("hover",page,s);
			}

		}
	}


	var Player=new boxObj();

	function dothis(Enmy1){
		setTimeout(function(){
			setInterval(function(){
				if(START_GAME){
					setTimeout(function(){
						tankHead(Enmy1,randNumber(4,0));
					},randNumber(2000,609));
					setTimeout(function(){
						tankHead(Enmy1,randNumber(4,0));
					},randNumber(2000,609));
					setTimeout(function(){
						if(Enmy1.Health>0)
							shoot_fire(Enmy1);
							if(Enmy1.weapon=="normalShot")
								playSound("shot1E");
							else{
								playSound("shot2E");
								setTimeout(function(){
									playSound("shotBig");
								},1000)
								
							}
								
							
							
					},randNumber(2000,609));
				}
			},1000);

		},100);
	}



	function createShotObj(pos,size,accStrong,colr,look,WeaponType,dTank,obj){
		
			var x=pos.X;
			var y=pos.Y;
			
			if(WeaponType=="normalShot"){
				var g=new shotObj();
				g.setBox(
					{
						
						shape_size:{sizeX:size.X,sizeY:size.Y} ,
						type:"box",
						damage:dTank,
						boxAccXz:1.7,
						WeaponType:WeaponType,
						boxColor : colr,
						shooterID:obj.ID,
						afterFinishAni:function(obj){
							if(!obj.IsOutRang){
								obj.boxColor.a-=0.009;
								if(obj.boxColor.a<0.00001){
									obj.IsOutRang=true;

								}

							}
						}
					}
				);
			}else if(WeaponType=="BigBoom"){
				var g=new shotObj();
				var val=1.3;
				g.setBox(
					{
						
						shape_size:{sizeX:size.X,sizeY:size.Y} ,
						type:"box",
						boxAccXm : 0.1,
						boxAccYm : 0.1,
						boxAccXz:val,
						damage:dTank,
						WeaponType:WeaponType,
						shooterID:obj.ID,
						boxColor : new color( 255, 220, 20, 0.8 ),
						afterFinishAni:function(obj){
							
							if(!obj.IsOutRang){
								obj.boxColor.a-=0.009;

								if(obj.boxColor.a<0.0001){
									obj.IsOutRang=true;

								}
								draw_cir_stork(
									(obj.shape_pos.X),
									obj.shape_pos.Y,
									new color(200,0,0,1),2
								);
								draw_cir_stork(
									(obj.shape_pos.X+obj.shape_size.sizeX),
									obj.shape_pos.Y+obj.shape_size.sizeY,
									new color(200,0,0,1),2
								);
								draw_cir_stork(
									(obj.shape_pos.X+obj.shape_size.sizeX),
									obj.shape_pos.Y,
									new color(200,0,0,1),2
								);
								draw_cir_stork(
									(obj.shape_pos.X),
									obj.shape_pos.Y+obj.shape_size.sizeY,
									new color(200,0,0,1),2
								);
								
								obj.shape_pos.X-=obj.boxAccXz/4;
								obj.shape_pos.Y-=obj.boxAccXz/4;
								obj.shape_size.sizeX+=obj.boxAccXz;
								obj.shape_size.sizeY+=obj.boxAccXz;
								
								draw_cir_stork(obj.shape_pos.XT,obj.shape_pos.YT,obj.boxColor,obj.shape_size.sizeX);
								obj.after(0.4,2,function(){
									if(typeof obj.shape_size.s1 ==="undefined")
										obj.shape_size.s1=0;
									else
										obj.shape_size.s1+=obj.boxAccXz*val;
									draw_cir_stork(obj.shape_pos.XT,obj.shape_pos.YT,obj.boxColor,obj.shape_size.s1);
									
								});
								obj.after(0.8,1,function(){
									if(typeof obj.shape_size.s2 ==="undefined")
										obj.shape_size.s2=0;
									else
										obj.shape_size.s2+=obj.boxAccXz*val;
									draw_cir_stork(obj.shape_pos.XT,obj.shape_pos.YT,obj.boxColor,obj.shape_size.s2);
									
								});
							}
						}
					}
				);
			}
			

			switch(look){
				case 3:
					g.boxAccX=accStrong;
					g.shape_pos.X=x+30;
					g.shape_pos.Y=y+10;
				break;
				case 2:
					g.boxAccX=accStrong*-1;
					g.shape_pos.X=x-15;
					g.shape_pos.Y=y+10;
				break;
				case 0:
					g.boxAccY=accStrong*-1;
					g.shape_pos.X=x+8;
					g.shape_pos.Y=y-15;

				
				break;
				case 1:
					g.shape_pos.X=x+8;
					g.shape_pos.Y=y+25;
					g.boxAccY=accStrong;

				break;
			}

			return g;
	}
	function shoot_fire(obj){

		var colr=obj.boxColor;

		var WeaponType=obj.weapon;
		var shotsObj =[];
		var accStrong=obj.ShotStrong;
		
		//f(WeaponType=="normalShot"){
		shotsObj.push(
			createShotObj(
				{X:obj.shape_pos.X,Y:obj.shape_pos.Y},
				{X:7,Y:7},
				accStrong,colr,obj.look,WeaponType,obj.damage,obj
			)
		);
			
		/*}else if (WeaponType=="TowShots"){
			shotsObj.push(
				createShotObj(
					{X:obj.shape_pos.X,Y:obj.shape_pos.Y},
					{X:7,Y:7},
					accStrong,colr,obj.look
				)
			);
		}*/
		for( var i = 0 ; i < shotsObj.length ; i++ ){
			ShotsAry.push(shotsObj[i]);
		}
		
	}
	/*
	ShotsAry.push(createShotObj(
		{X:30,Y:300},
		{X:7,Y:7},
		0,new color(255,255,255,1),3,"normalShot"
	));*/
	
	function tankHead(tank,pos){
		tank.boxAccX=0;
		tank.boxAccY=0;
		acval=tank.speed;
		switch(pos){
			case 1:
				tank.addAcc(0,acval);
				tank.look=1;
				tank.drawHolePos=function(AfterCalcXY){
					draw_rec(AfterCalcXY.X+7,AfterCalcXY.Y+20,this.boxColor,5,10);
				}
			break;
			case 0:
				tank.boxAccX=0;
				tank.boxAccY=0;
				tank.addAcc(0,acval*-1);
			
				tank.look=0;
				tank.drawHolePos=function(AfterCalcXY){
					draw_rec(AfterCalcXY.X+13,AfterCalcXY.Y,this.boxColor,-5,-10);
				}
			break;
			case 3:
				tank.boxAccX=0;
				tank.boxAccY=0;
				tank.addAcc(acval,0);
				tank.look=3;
				tank.drawHolePos=function(AfterCalcXY){
					draw_rec(AfterCalcXY.X+20,AfterCalcXY.Y+7,this.boxColor,10,5);
				}
			break;
			case 2:
				tank.boxAccX=0;
				tank.boxAccY=0;
				tank.addAcc(acval*-1,0);
				tank.look=2;
				tank.drawHolePos=function(AfterCalcXY){
					draw_rec(AfterCalcXY.X,AfterCalcXY.Y+7,this.boxColor,-10,5);
				}
			break;
		}

	}
	document.onkeydown  = function(e){
		/*enum playerLook{
			up:0,down:1,left:2,right:3
		};*/
		switch(e.which){
			case 40: //down
				tankHead(Player,1);
				
			break;
			case 38: //up
				tankHead(Player,0);
			break;
			case 39: //right
				tankHead(Player,3);
				
			break;
			case 37: //left
				tankHead(Player,2);
			break;
			case 32: //space
				if(Player.weapon=="normalShot")
					playSound("shot1");
				else{
					playSound("shot2");
					setTimeout(function(){
						playSound("shotBigP");
					},2000);
				}
					
				
				
				shoot_fire(Player);
				NUM_SHOTS++;
			break;
		}
	};
	/*
		AI
	*/

	/*****************/
	
	function is_coll(tank,shot){
		
		var TankmaxX = tank.shape_size.sizeX+tank.shape_pos.X;
		var TankminX  = tank.shape_pos.X;
		var TankmaxY = tank.shape_size.sizeY+tank.shape_pos.Y;
		var TankminY  = tank.shape_pos.Y;
		
		var shotMinX = shot.shape_pos.X;
		var shotMaxX = shot.shape_pos.X+shot.shape_size.sizeX;
		var shotMinY = shot.shape_pos.Y;
		var shotMaxY = shot.shape_pos.Y+shot.shape_size.sizeY;
		/*
		draw_cir_stork(shotMinX,shotMinY,new color(200,200,200,1),4);
		draw_cir_stork(shotMinX,shotMaxY,new color(200,200,200,1),4);
		draw_cir_stork(shotMaxX,shotMinY,new color(200,200,200,1),4);
		draw_cir_stork(shotMaxX,shotMaxY,new color(200,200,200,1),4);
		
		
		draw_cir_stork(TankminX,TankminY,new color(200,200,200,1),4);
		draw_cir_stork(TankminX,TankmaxY,new color(200,200,200,1),4);
		draw_cir_stork(TankmaxX,TankminY,new color(200,200,200,1),4);
		draw_cir_stork(TankmaxX,TankmaxY,new color(200,200,200,1),4);*/
		if(
			(
				(shotMinX > TankminX  && shotMinX < TankmaxX) ||
				(shotMaxX > TankminX  && shotMaxX < TankmaxX) 
			) &&
			(
				(shotMinY > TankminY  && shotMinY < TankmaxY) ||
				(shotMaxY > TankminY  && shotMaxY < TankmaxY) 
			)
		){
			if(tank.ID!=shot.shooterID){

				if(tank.Shild>0){
					if(tank.Shild<10){
						tank.Shild--;
						if((shot.damage-tank.Shild)>0)
							tank.Health-=(shot.damage-tank.Shild);
						else{
							tank.Health-=10;
							tank.Shild-=2;
						}
					}else if(tank.Shild<20){
						tank.Shild--;
						if((shot.damage-tank.Shild)>0)
							tank.Health-=(shot.damage-tank.Shild);
						else{
							tank.Health-=10;
							tank.Shild-=2;
						}
							
					}else{
						tank.Health-=5;
						tank.Shild-=2;
					}

				
				}else{
					tank.Health-=shot.damage;
				}
				
				if(tank.Health<=0){
					playSound("kill");
				}
				
				if(shot.WeaponType!="BigBoom"){
					shot.IsOutRang=true;
					shot.damage=0;
				}

				
			}

		}
	}
	function isObj(obj){
		if(typeof obj === "undefined")
			return false;
		else
			return true;

	}



	function start_game(){
		//var tankType=document.querySelector("input>tankType").value;
		//alert(tankType);
		Player.setBox(
			{
				shape_pos : {X:600,Y:300},
				shape_size:{sizeX:20,sizeY:20} ,
				boxAccX : 0,
				boxAccY : 0,
				boxAccXm : 0.04,
				boxAccYm : 0.04,
				ShotStrong:6.2,
				damage:40,
				Shild:10,
				ID:"Player",
				weapon:"normalShot",
				boxColor : new color( 255, 20, 20, 0.8 ),
				look:1,
				drawShape : function(AfterCalcXY){
						if(this.Health>=60)
							draw_rec(AfterCalcXY.X,AfterCalcXY.Y-10,new color(0,200,0,1),this.Health*0.2,5);
						else if(this.Health>=40)
							draw_rec(AfterCalcXY.X,AfterCalcXY.Y-10,new color(200,100,0,1),this.Health*0.2,5);
						else if(this.Health<40)
							draw_rec(AfterCalcXY.X,AfterCalcXY.Y-10,new color(255,0,0,1),this.Health*0.2,5);
						
						
						draw_rec(AfterCalcXY.X,AfterCalcXY.Y,this.boxColor,20,20);
						this.drawHolePos(AfterCalcXY);
				},
				drawHolePos:function(AfterCalcXY){
						draw_rec(AfterCalcXY.X+7,AfterCalcXY.Y+20,this.boxColor,5,10);
				}
			}
		);
		TanksAry.push(Player);

		var EnmyCount=0;
		var NUMBEROFENMY=4;
		
		setInterval(function(){
			if(START_GAME){
				if(EnmyCount<NUMBEROFENMY){
					CreateEnmyCount(1,"normalShot",10,new color(200,200,0,0.8),5);
					EnmyCount++;
				}
			}
		},600);
		setInterval(function(){
				if(START_GAME){
					if(EnmyCount<NUMBEROFENMY){
						CreateEnmyCount(1,"normalShot",10,new color(200,200,0,0.8),5);
						EnmyCount++;
					}
				}
		},1000);
		setInterval(function(){
			if(START_GAME){
					CreateEnmyCount(2,"normalShot",30,new color(20,20,20,1),50);
			}
		},20000);
		setInterval(function(){
				if(START_GAME){
					CreateEnmyCount(5,"normalShot",10,new color(200,20,200,1),10);
					CreateEnmyCount(5,"BigBoom",10,new color(200,20,200,1),10);
				}
			},50000);
		START_GAME=true;
		document.getElementById("scors").style.opacity=1;
	}
		function CreateEnmyCount(num,weapon,weapon_power,colr,sh){
				for(var i=0;i<num;i++){
					var Enmy1=new boxObj();
					Enmy1.setBox(
						{
							shape_pos : {X:randNumber(800,109)-(20),Y:randNumber(300,109)},
							shape_size:{sizeX:randNumber(20,10),sizeY:randNumber(20,10)} ,
							boxAccX : 0,
							boxAccY : 0,
							boxAccXm : 0.04,
							boxAccYm : 0.04,
							ShotStrong:5.2,
							damage:weapon_power,
							weapon:weapon,
							boxColor : colr,
							Shild:sh,
							look:randNumber(4,0),
							drawShape : function(AfterCalcXY){
									if(this.Health>=60)
										draw_rec(AfterCalcXY.X,AfterCalcXY.Y-10,new color(0,200,0,1),this.Health*0.2,5);
									else if(this.Health>=40)
										draw_rec(AfterCalcXY.X,AfterCalcXY.Y-10,new color(200,100,0,1),this.Health*0.2,5);
									else if(this.Health<40)
										draw_rec(AfterCalcXY.X,AfterCalcXY.Y-10,new color(255,0,0,1),this.Health*0.2,5);
									draw_rec(AfterCalcXY.X,AfterCalcXY.Y,this.boxColor,20,20);
									this.drawHolePos(AfterCalcXY);
							},
							drawHolePos:function(AfterCalcXY){
									draw_rec(AfterCalcXY.X+7,AfterCalcXY.Y+20,this.boxColor,5,10);
							}
						}
					);
					
					TanksAry.push(Enmy1);
					dothis(Enmy1);
				}
				
		}
	document.getElementById("start_game").onclick=function(){
		start_game();
		
		//document.getElementById("GameIntro2").style.opacity=0;
		//document.getElementById("GameIntro3").style.opacity=0;
		document.getElementById("GameIntro4").style.opacity=0;
		setTimeout(function(){
			document.getElementById("GameIntro1").style.padding=0;
			//document.getElementById("GameIntro2").style.display="none";
			//document.getElementById("GameIntro3").style.display="none";
			document.getElementById("GameIntro4").style.display="none";
		},1000);
	};
	function CalcCollitions(TanksAry,ShotsAry){
		for( var t = 0 ; t < TanksAry.length ; t++ ){
			
			for( var s = 0 ; s < ShotsAry.length ; s++ ){
				is_coll(TanksAry[t],ShotsAry[s]);
			}
				
		}
		
	}
	function GameLoop() {
		
		window.requestAnimationFrame(GameLoop);

		 now = Date.now();
		delta = now - then;
		 
		if (delta > interval) {
			ctx.clearRect(0,0,gameCanvas.width,gameCanvas.height); // clear canvas
			then = now - (delta % interval);
			document.getElementById("score").innerHTML=NUM_DEAD;
			document.getElementById("shots").innerHTML=NUM_SHOTS;
			document.getElementById("health").innerHTML=Player.Health;
			
			AfterSecs(1,1,function(){
				document.getElementById("GameIntro1").style.opacity=1;
			});
			/*AfterSecs(2,2,function(){
				document.getElementById("GameIntro2").style.opacity=1;
			});
			AfterSecs(3,3,function(){
				document.getElementById("GameIntro3").style.opacity=1;
			});*/
			AfterSecs(2,4,function(){
				document.getElementById("GameIntro4").style.opacity=1;
			});
			/*CalcCollitions(TanksAry,ShotsAry);
			Player.draw(gameCanvas.width,gameCanvas.height,mouseXY);
			for(var b=0;b<ShotsAry.length;b++){
				ShotsAry[b].draw(gameCanvas.width,gameCanvas.height,mouseXY);
			}*/
			
					
					for(var b=0;b<ShotsAry.length;b++){
						ShotsAry[b].draw(gameCanvas.width,gameCanvas.height,mouseXY);
					}
					for(var b=0;b<TanksAry.length;b++){
						TanksAry[b].draw(gameCanvas.width,gameCanvas.height,mouseXY);
						//draw_cir_stork(TanksAry[b].shape_pos.X+TanksAry[b].shape_size.sizeX,TanksAry[b].shape_pos.Y+TanksAry[b].shape_size.sizeY,TanksAry[b].boxColor,14);
					}
					CalcCollitions(TanksAry,ShotsAry);
					
			
			if(Player.Health<=0){
				console.log("gameOver");
				START_GAME=false;
			}

		}
		
	}
	function rebuild(ary){
		var tary=[];
		for(var i =0 ; i < ary.length; i ++){
			if(!ary[i].IsOutRang){
				tary.push(ary[i]);
			}
		}
		return tary;
	}
	function rebuildT(ary){
		var tary=[];
		for(var i =0 ; i < ary.length; i ++){
			if(ary[i].Health>0){
				tary.push(ary[i]);
			}else{
				CreateEnmyCount(1,"normalShot",10,new color(230,200,230,1),15);
				if(NUM_DEAD>3)
					Player.weapon="BigBoom";
				else if(NUM_DEAD>20)
					CreateEnmyCount(1,"BigBoom",20,new color(230,200,0,1),5);
				else if(NUM_DEAD>50)
					CreateEnmyCount(1,"BigBoom",50,new color(20,20,0,1),5);

					
				
				NUM_DEAD++;
			}
		}
		return tary;
	}
	setInterval(function(){
		if(START_GAME)
			ShotsAry=rebuild(ShotsAry);
	},10000);
	setInterval(function(){
		if(START_GAME)
			TanksAry=rebuildT(TanksAry);
	},800);
	
	(function() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
									   || window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				  timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};

		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
	}());
	window.requestAnimationFrame(GameLoop);
})();