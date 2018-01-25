var game = new Phaser.Game(1920, 1080, Phaser.AUTO, 'phaser-example', {
    preload: preload,
    create: create,
    update: update
});

var playAgainButton;
var endCondition;

var animdur= 300;
var intro=8;
var pass;
var g;
var logo;
var franklin;
var sl;
var currentAttack;
var select=false;
var attacks; //a group to store all attack cards, if anyone has a better idea to store them feel free to do it
var wave; //a group for all enemies, not implemented yet
var wavenumber=2; //a var that stores which wave is currently on the board
//for every animal there is a variable storing an object with various attributes
var panda = {
    name: "Panda",
    energy: 10,
    hp: 10
};
var elk = {
    name: "Elk",
    energy: 10,
    hp: 10
};
var kangaroo = {
    name: "Kangaroo",
    energy: 10,
    hp: 10
};
var animals = [panda, elk, kangaroo];//all animals are stored in an array called animals
var currentplayer = animals[0]; //a variable storing a reference to the current player
var cpower = 0; //current power: this variable adds up all attack power of a joint attack
var target; //a substitute for a real enemy
var bonusdamage = 0; //attack 1 of the Panda increases bonusdamage by 1
var btext;
var selectturn = 0;
var inputrdy = true; //a variable that determines wether the program is ready for input
var hptext; //variables for text objects (a phaser class, being displayed)
var energytext;
var cattack = []; //an array to store the numbers of the attack cards that are being used for the current attack
var cturn = 0; //current turn: 0=panda 1=elk 2=kangaroo
var pturn = 0; //player turn: player turn changes every round (after 3 turns)
var tcount = 0; //turn count: after each action it counts 1 up
var wave2powerup = true;
var protection = false;
var doublepower = false;
var advantage;
var advtext;
//all attack card effects are implemented in separate functions (pA1 stands for panda Attack 1) and then stored in an array of functions (effects array)

/*function Panda Attack 1, parameter "help" stands for whether there is assistance of other players or not (can be true or false),
effect: attack power = 4, raises allies power by 1 for this wave. Stacks up to three times*/
function pA1(help) {
    if (bonusdamage < 3) {
        bonusdamage++;
    }
    cpower+=4+bonusdamage*cattack.length;
}

function pA2(help) {
    if (help) {
        for(i=0;i<cattack.length;i++){
            if(cattack[i] <= 2){
                panda.hp += 2;
            }
            if(cattack[i] <= 5 && cattack[i] >= 3){
                elk.hp += 2;
            }
            if(cattack[i] >= 6){
                kangaroo.hp += 2;
            }
        }
        hptext.text = "HP: " + currentplayer.hp;
    }
    cpower += 3;
}

function pA3(help) {
    if (help) {
        cpower += 8;
    } else {
        cpower += 5;
    }
}

function eA1(help){
    cpower+=4;
    for(i=0;i<animals.length;i++){
        animals[i].energy++;
    }
}

function eA2(help){
    cpower+=14;
    if(cattack.length===2){
        elk.hp-=2;
    }else if (cattack.length===3){
        elk.hp-=5;
    }
}

function eA3(help){
  cpower+=6;
  if(wavenumber!==-1){
    target.atk-=2;
  }

}

function kA1(help){
  var x=5;
  if(doublepower){
    x*=2;
    doublepower=false;
  }
  cpower+=x;
  for(i=0;i<wave.children.length;i++){
    wave.children[i].hp-=3;
  }
}

function kA2(help){
  var x;
    if(help){
        x=8;
    } else {
       x=20;
    }
    if(doublepower){
      x*=2;
      doublepower=false;
    }
    cpower+=x
}

function kA3(help){
  cpower+=0;
  doublepower=true;
  if(!help){
  protection=true;
  }
}

var effects = [
    function() {
        pA1(help)
    },
    function() {
        pA2(help)
    },
    function() {
        pA3(help)
    },
    function() {
        eA1(help)
    },
    function() {
        eA2(help)
    },
    function() {
        eA3(help)
    },
    function() {
        kA1(help)
    },
    function() {
        kA2(help)
    },
    function() {
        kA3(help)
    }
];

//a function to determine wether an array contains a certain object
function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function preload() {
    game.load.image("victory", "../assets/sprites/victoryRibbon.png");
    game.load.image("defeat", "../assets/sprites/defeatRibbon.png");
    game.load.image("againBtn", "../assets/sprites/playAgainButton.png");
    game.load.spritesheet("attackssheet", "../assets/sprites/attacks2.png", 200, 300, 9); //laoding the attacksheet
    game.load.spritesheet("animals", "../assets/sprites/animals.png", 497, 693, 3);
    game.load.spritesheet("enemies", "../assets/sprites/enemies.png", 375, 525, 3);
    game.load.image("pass", "../assets/sprites/pass.png");
    game.load.image("logo", "../assets/sprites/logo.png");
    game.load.image("technus", "../assets/sprites/Technus.png");
    game.load.spritesheet("turtle","../assets/sprites/Frank.png",1920,1080,7);
    game.load.spritesheet("bg", "../assets/bg.png",1978 ,1109 ,14);
    game.load.audio('title', '../assets/sounds/TitleScreen.mp3');
    game.load.audio('boss1', '../assets/sounds/boss1.mp3');
    game.load.audio('boss2', '../assets/sounds/boss2.mp3');
    game.load.audio('win', '../assets/sounds/GameWon.mp3');
    game.load.audio('wave2', '../assets/sounds/AxeMan.mp3');
    game.load.audio('wave1', '../assets/sounds/ChainsawGuy.mp3');
    game.load.audio('wave0', '../assets/sounds/BuzzOTron.mp3');
    game.load.audio('cardplayed', '../assets/sounds/CardPlay.mp3');
    game.load.audio('gameover', '../assets/sounds/GameOver.mp3');
    game.load.audio('passaudio', '../assets/sounds/Pass.mp3');
    game.load.audio('atk0', '../assets/sounds/Inspire.mp3');
    game.load.audio('atk1', '../assets/sounds/Grace.mp3');
    game.load.audio('atk2', '../assets/sounds/StrikeAsOne.mp3');
    game.load.audio('atk3', '../assets/sounds/Charge.mp3');
    game.load.audio('atk4', '../assets/sounds/Sacrifice.mp3');
    game.load.audio('atk5', '../assets/sounds/Persuasion.mp3');
    game.load.audio('atk6', '../assets/sounds/Multistrike.mp3');
    game.load.audio('atk7', '../assets/sounds/Roar.mp3');
    game.load.audio('atk8', '../assets/sounds/Protection.mp3');
}

function create() {
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //variables becoming groups
    attacks = game.add.group();
    wave = game.add.group();

    var background = game.add.sprite(0, 0,'bg');
    background.inputEnabled = true;
    background.events.onInputDown.add(bgclick, this);
    var anim = background.animations.add('flames');
    anim.play(10, true);
    logo = game.add.sprite(game.width/2,game.height/2,'logo');
    logo.anchor.set(0.5, 0.5);
    logo.scale.setTo(2,2);
    logo.music = game.add.audio('title');
    logo.music.play();
    logo.music.loopFull(0.05);
    //enabling input for groups
    wave.inputEnableChildren = true;
    attacks.inputEnableChildren = true;
    //just like in the exmaple in class including a listener & the onDown function when an attack card is clicked
    wave.onChildInputDown.add(enemyClick, this);

}
function initanimals(){
  //variables are being filled with text objects
  hptext = game.add.text(game.width / 2, 1500, "HP: " + currentplayer.hp);
  energytext = game.add.text(game.width / 2, 1500, "Energy: " + currentplayer.energy);

  //the panda object gets a new property called sprite (idk if the naming can cause any problems) storing the actual displayed sprite
  for (var i = 0; i < animals.length; i++) {
      animals[i].sprite = game.add.sprite(game.width / 2, 1500, 'animals');
      animals[i].sprite.frame = i;
      animals[i].sprite.scale.setTo(0.5, 0.5);
      animals[i].sprite.anchor.set(0.5, 0.5);
  }

  //some movement through tweens and bringing the hp and energy text to the foreground
  game.add.tween(currentplayer.sprite).to({
      x: 1650,
      y: 850
  }, animdur, Phaser.Easing.Quadratic.Out, true);
  game.add.tween(energytext).to({
      x: 1550,
      y: 930
  }, animdur, Phaser.Easing.Quadratic.Out, true);
  game.add.tween(hptext).to({
      x: 1550,
      y: 880
  }, animdur, Phaser.Easing.Quadratic.Out, true);
  game.world.bringToTop(hptext);
  game.world.bringToTop(energytext);
}

function initattacks(){
  btext = game.add.text(100, 1000, "Bonus Damage: " + bonusdamage);
  btext.addColor("#ffffff", 0);
  pass = game.add.sprite(350, 900, 'pass');
  pass.scale.setTo(0.25,0.25);
  pass.inputEnabled = true;
  pass.events.onInputDown.add(passing, this);

  //init of the attack cards
  for (i = 0; i < 9; i++) {
      var attack = attacks.create(game.width / 2, 1500, "attackssheet");
      game.world.bringToTop(attacks);
      attack.scale.setTo(1, 1);
      attack.frame = i;
      attack.anchor.set(0.5, 0.5);
      attack.number = i;
      attack.effect = effects[i];
      if (i < 3) {
          game.add.tween(attack).to({
              x: game.width / 2 - 250 + i * 250,
              y: 900
          }, animdur, Phaser.Easing.Quadratic.Out, true);
      }
  }
}
//spawning the next wave
function nextwave(){
  bonusdamage = 0;
  btext.text = "Bonus Damage:"+bonusdamage;
  if(wavenumber === -1){
    var enemy = wave.create(game.width / 2, -500, "technus");
    enemy.hp=80;
    enemy.atk=0;
    enemy.anchor.set(0.5, 0.5);
    enemy.scale.setTo(0.3,0.3);
    game.add.audio('boss1').play();
    game.add.tween(enemy).to({
        x: game.width/2,
        y: 200
    }, animdur, Phaser.Easing.Quadratic.Out, true);
    enemy.atktext = game.add.text(game.width/2-40, 350, "Atk: " + enemy.atk);
    enemy.hptext = game.add.text(game.width/2-40, 20, "HP: " + enemy.hp);
    enemy.atktext.addColor("#ffffff", 0);
    enemy.hptext.addColor("#ffffff", 0);
  } else {
      game.add.audio('wave'+wavenumber).play();
  }
  for (var i = 0; i < wavenumber+1; i++) {
      var enemy = wave.create(game.width / 2, -500, "enemies");
      game.world.bringToTop(wave);
      enemy.frame = wavenumber;
      enemy.scale.setTo(0.55, 0.55);
      enemy.anchor.set(0.5, 0.5);
      switch(wavenumber){
        case 0:
        enemy.hp=14;
        enemy.atk=18;
        break;
        case 1:
        enemy.hp=12;
        enemy.atk=14;
        break;
        case 2:
        enemy.hp=10;
        enemy.atk=10;
        break;
      }
      enemy.atktext = game.add.text(game.width * 0.5 / (wavenumber+2) * (i + 1) + game.width * 0.25-40, 350, "Atk: " + enemy.atk);
      enemy.hptext = game.add.text(game.width * 0.5 / (wavenumber+2) * (i + 1) + game.width * 0.25-40, 20, "HP: " + enemy.hp);
      enemy.atktext.addColor("#ffffff", 0);
      enemy.hptext.addColor("#ffffff", 0);
      game.add.tween(enemy).to({
          x: (game.width * 0.5 / (wavenumber+2)) * (i + 1) + game.width * 0.25,
          y: 200
      }, animdur, Phaser.Easing.Quadratic.Out, true);
  }
  for(i=0;i<animals.length;i++){
    animals[i].hp=10;
    animals[i].energy=10;
  }
  energytext.text = "Energy: " + currentplayer.energy;
  hptext.text = "HP: " + currentplayer.hp;
}

function initEnd(condition)
{
    attacks.destroy(true);
    for(i = 0;i < wave.children.length; i++)
    {
        wave.children[i].hptext.destroy();
        wave.children[i].atktext.destroy();
    }
    wave.destroy(true);
    for(i = 0; i < animals.length; i++)
    {
        animals[i].sprite.destroy();
    }
    hptext.destroy();
    energytext.destroy();
    pass.destroy();
    wavenumber = 2;
    for(i = 0; i < animals.length; i++)
    {
        animals[i].hp=10;
        animals[i].energy=10;
    }
    attacks = game.add.group();
    wave = game.add.group();
    //enabling input for groups
    wave.inputEnableChildren = true;
    attacks.inputEnableChildren = true;
    //just like in the exmaple in class including a listener & the onDown function when an attack card is clicked
    wave.onChildInputDown.add(enemyClick, this);
    btext.destroy();
    //attacks.onChildInputDown.add(onDown, this);
    currentplayer = animals[0];
    bonusdamage = 0;
    cpower = 0;
    cturn = 0;
    pturn = 0;
    tcount = 0;
    selectturn = 0;
    wave2powerup = true;
    protection = false;
    doublepower = false;
    console.log("wot?");
    if(condition) //checking if it's victory or defeat
        {
            game.add.audio('win').play();
            endCondition = game.add.sprite(game.width/2, game.height/2, 'victory'); //image loaded at line 189
            endCondition.anchor.set(0.5, 0.5);
        }
    else
        {
            game.add.audio('gameover').play();
            endCondition = game.add.sprite(game.width/2, game.height/2, 'defeat'); //line 190
            endCondition.anchor.set(0.5, 0.5);
        }
    game.add.tween(endCondition.scale).to({x: 0.7, y: 0.7}, 1000, Phaser.Easing.Linear.Out, true); //this tween should work the same way as it does for Yoran's tree
                                                                                                    //but I am not sure if it will

    playAgainButton = game.add.sprite(game.width/2, 700, 'againBtn'); //line 191
    playAgainButton.anchor.set(0.5, 0.5);
    playAgainButton.scale.setTo(0.7,0.7)
    game.add.tween(playAgainButton.scale).to({x: 0.3, y: 0.3}, 1000, Phaser.Easing.Linear.Out, true);
    playAgainButton.inputEnabled = true;
    playAgainButton.events.onInputDown.add(playagain, this);
}

function playagain(){
    //everything before this line goes in initend(), everything after this line goes in playagain button click
    playAgainButton.destroy();
    endCondition.destroy();
    initanimals();
    initattacks();
    nextwave();
    cattack = [];
}
//this function takes care of the movement of the cards when players change
function nextplayer() {
    inputrdy = false;
    if (cturn > -1) {
        game.add.tween(currentplayer.sprite).to({
            x: game.width / 2,
            y: 1550
        }, animdur, Phaser.Easing.Quadratic.Out, true);
        hptext.visible = false;
        energytext.visible = false;
        for (i = 0; i < 3; i++) {
            if (!(contains(cattack, attacks.children[i + (cturn * 3)].number))) {
                game.add.tween(attacks.children[i + (cturn * 3)]).to({
                    x: game.width / 2,
                    y: 1550
                }, animdur, Phaser.Easing.Quadratic.Out, true);
            }
        }
    }
    if (cturn >= 2) {
        cturn = 0;
    } else {
        cturn++;
    }
    currentplayer = animals[cturn];
    energytext.text = "Energy: " + currentplayer.energy;
    hptext.text = "HP: " + currentplayer.hp;
    for (i = 0; i < 3; i++) {
        game.add.tween(attacks.children[i + (cturn * 3)]).to({
            x: game.width / 2 - 250 + i * 250,
            y: 900
        }, animdur, Phaser.Easing.Quadratic.Out, true);
    }
    var ttween = game.add.tween(currentplayer.sprite).to({
        x: 1650,
        y: 850
    }, animdur, Phaser.Easing.Quadratic.Out, true);
    ttween.onComplete.add(function() {
        inputrdy = true;
        hptext.visible = true;
        energytext.visible = true;
    });
}
function fightanimation(successfull){
  var t;
  var damagetext;
  if(contains(cattack,6))
  {
    var multitext =[];
  for(i=0;i<wave.children.length;i++){
    multitext.push(game.add.text(wave.children[i].hptext.x+20, wave.children[i].hptext.y+50, "-3"));
    multitext[i].addColor("#ff0000", 0);
    var mt= game.add.tween(multitext[i]).to({
      x: multitext[i].x,
      y: (multitext[i].y-50)
    }, 300, Phaser.Easing.Quadratic.Out, true);
  }
  mt.onComplete.add(function() {
    for(p=0;p<multitext.length;p++){
        multitext[p].destroy();
    }
  });
  }
  advtext = game.add.text(50, 600, "Battle advantage: "+(advantage*-1),{font:"bold 30pt Arial"});
  if(advantage<=0){
    advtext.addColor("#00ff00", 0);
  } else {
    advtext.addColor("#ff0000", 0);
  }
  if(successfull){
    game.add.audio('atk'+cattack[0]).play();
    damagetext = game.add.text(target.hptext.x+20, target.hptext.y+50, "-"+(cpower-target.atk));
    damagetext.addColor("#ff0000", 0);
    var tt = game.add.tween(target).to({
      x: target.x+20,
      y: target.y
    }, 10, Phaser.Easing.Linear.Out, true,0,-1,true);
    t = game.add.tween(damagetext).to({
      x: damagetext.x,
      y: (damagetext.y-50)
    }, 1000, Phaser.Easing.Quadratic.Out, true);
    t.onComplete.add(function() {
      afteranim();
        damagetext.destroy();
        tt.stop();
        advtext.destroy();
    });
  } else {
    game.add.audio('wave'+wavenumber).play();
    var multitween = [];
    for(i=0;i<cattack.length;i++){
      multitween.push(game.add.tween(attacks.children[cattack[i]]).to({x: attacks.children[cattack[i]].x+20, y: attacks.children[cattack[i]].y}, 10, Phaser.Easing.Linear.Out, true,0,30,true));
    }
    damagetext = game.add.text(900, 500, "-"+(target.atk-cpower));
    damagetext.addColor("#ff0000", 0);
    t = game.add.tween(damagetext).to({
      x: damagetext.x,
      y: (damagetext.y-50)
    }, 1000, Phaser.Easing.Quadratic.Out, true);
    t.onComplete.add(function() {
      afteranim();
      advtext.destroy();
      damagetext.destroy();
    });
  }
}
//a layout function for the attack cards that are currently played p*200+game.width/2-(cattack.length-1)*200
function layout() {
    for (p = 0; p < cattack.length; p++) {
        game.add.tween(attacks.children[cattack[p]]).to({
            x: (game.width * 0.5 / (cattack.length + 1)) * (p + 1) + game.width * 0.25,
            y: 550
        }, animdur, Phaser.Easing.Quadratic.Out, true);
    }
}

//a function to reset the remaining cards (after the 3rd turn)
function spritereset() {
    game.add.tween(currentplayer.sprite).to({
        x: game.width / 2,
        y: 1550
    }, animdur, Phaser.Easing.Quadratic.Out, true);
    hptext.visible = false;
    energytext.visible = false;
    for (i = 0; i < 9; i++) {
        if (!(contains(cattack, i))) {
            game.add.tween(attacks.children[i]).to({
                x: game.width / 2,
                y: 1550
            }, animdur, Phaser.Easing.Quadratic.Out, true);
        }
    }
}

function endround() {
    var temp;
    for (p = 0; p < cattack.length; p++) {
        temp = game.add.tween(attacks.children[cattack[p]]).to({
            x: game.width / 2,
            y: 1550
        }, animdur, Phaser.Easing.Quadratic.Out, true);
    }
    temp.onComplete.add(function() {
        target.tint = 0xffffff;
        nextplayer();
    });
    tcount = 0;
    cattack = [];
}
//this function checks whether it's the round's end if yes it initialises the damage calculation
function checkroundend() {
    //tcount is 3 after each player has performed an action
    if (tcount == 3) {
        inputrdy = false;
        var helps = false;
        if (cattack.length > 1) {
            helps = true;
        }
        for (p = 0; p < cattack.length; p++) {
            attacks.children[cattack[p]].effect(help = helps);
        }
        switch(wavenumber){
          case 0:
          wave.children[0].atk+=1;
          break;
          case 1:

          break;
          case 2:
          if(cattack.length>1){
            target.atk=14;
          } else {
            target.atk=10;
          }
          break;
        }
        btext.text = "Bonus Damage:"+bonusdamage;
        advantage = Math.floor(Math.random() * ((cattack.length+1)*2)) - 3;
        cpower-=advantage;
        if(cpower>=target.atk){
          fightanimation(true);
          target.hp -= (cpower-target.atk);
        } else {
          for(i=0;i<cattack.length;i++){
              if(cattack[i] <= 2){
                  panda.hp-= (target.atk-cpower);
                  console.log(panda.hp);
              }
              if(cattack[i] <= 5 && cattack[i] >= 3){
                  elk.hp-= (target.atk-cpower);
              }
              if(cattack[i] >= 6 && !protection){
                  kangaroo.hp-= (target.atk-cpower);
              }
          }
          if(contains(cattack,8) && cattack.length === 1){
            game.add.audio('atk'+cattack[0]).play();
            game.time.events.add(Phaser.Timer.SECOND, afteranim, this);
          } else {
            fightanimation(false);
          }
        }
      } else {
          nextplayer();
      }
}
function afteranim(){
  if(wavenumber===-1){
    var damage = [1, 2, 3];
    for(i=0;i<3;i++){
      console.log("Technus damage: "+damage[Math.floor(Math.random() * damage.length)])
      animals[i].hp-=damage[Math.floor(Math.random() * damage.length)];
    }
  }
  if(panda.hp <= 0 || elk.hp <= 0 || kangaroo.hp <= 0){
    inputrdy=false;
    initEnd(false);
    game.time.events.add(Phaser.Timer.SECOND, function(){inputrdy=true;}, this);
    return;
  }

  for(i=0;i<wave.children.length;i++){
  wave.children[i].atktext.text = "Atk: "+wave.children[i].atk;
  wave.children[i].hptext.text = "HP: "+wave.children[i].hp;
  }
  for(i=0;i<wave.children.length;i++){
    if(wave.children[i].hp<=0){
      if(wavenumber===-1){
        wavenumber=42;
        game.add.audio('boss2').play();
        game.time.events.add(Phaser.Timer.SECOND, function(){initEnd(true);}, this);
        game.time.events.add(Phaser.Timer.SECOND*2, function(){inputrdy=true;}, this);
        return;
      }
      wave.children[i].atktext.destroy();
      wave.children[i].hptext.destroy();
      wave.children[i].destroy();
      i--;
    }
  }
  if(wavenumber===-1){
  game.add.audio('boss1').play();}
  if(wavenumber===1 &&wave.children.length===1 && wave2powerup){
    wave.children[0].atk = 24;
    wave.children[0].atktext.text = "Atk: "+wave.children[0].atk;
    wave2powerup = false;
  }
  if(wave.children.length<1){
    wavenumber--;
    game.time.events.add(Phaser.Timer.SECOND, nextwave, this);
  }
  cpower = 0;
  tcount++;
  if (pturn == 2) {
      pturn = 0;
  } else {
      pturn++;
  }
  cturn = pturn - 1;
  spritereset();
  endround();
}


//function for passing
function passing() {
    if (inputrdy && tcount != 4) {
        if (tcount === selectturn && currentplayer.energy>1 && cattack.length === 0) {
            pass.tint = 0xff0000;
            game.time.events.add(Phaser.Timer.SECOND * 0.3, function(){pass.tint = 0xffffff;}, this);
        } else{
            game.add.audio('passaudio').play();
            if(currentplayer.energy<=1){
            if(tcount === selectturn){
              selectturn++;
              if(selectturn===3){
              initEnd(false);
              return;
              }
            }
            }
            tcount++;
            checkroundend();
        }
    }
}

function onDragStop(attack) //event function that is called when the attack card is dropped
{
  currentAttack = attack.number;
    if(attack.y < 680)
    {
        attack.input.draggable = false;
        //game.add.tween(attack).to({ x: 800 + attack.frame * 220, y: 500 }, 200, Phaser.Easing.Linear.None, true, 0);
        layout();

        if (currentplayer.energy > 1 && inputrdy && !(contains(cattack, attack.number)))
        {
            if(tcount==selectturn)
            {
                selectturn = 0;
                inputrdy=false;
                select=true;
                g =game.add.graphics(0,0);
                g.lineStyle(10, 0x00FFFF, 100);
                sl=new Phaser.Point(attack.x, attack.y);
                cattack.push(attack.number);
            }
            else
            {
                game.add.audio('cardplayed').play();
                tcount++;
                //energy being subtracted
                currentplayer.energy -= 2;
                energytext.text = "Energy: "+currentplayer.energy;
                cattack.push(attack.number);
                layout();
                checkroundend();
            }
        }
        else
        {
            //if current player has less than 2 energy this message appears
            console.log("Out of energy or Input not rdy");
            backwardLayout(attack);
        }
    }
    else
    {
        backwardLayout(attack);
    }
}

function backwardLayout(sprite) //returning a card to the player if it is not played
{
    var spriteFrame;

    if(sprite.frame > 5)
        {
            spriteFrame = sprite.frame - 6;
        }
    else if(sprite.frame > 2)
        {
            spriteFrame = sprite.frame - 3;
        }
        else
        {
            spriteFrame = sprite.frame;
        }

    game.add.tween(sprite).to({ x: 700 + spriteFrame * 250, y: 900 }, 200, Phaser.Easing.Linear.None, true, 0);
}

function enemyClick(enemy) {
  if(select && intro < 0){
    game.add.audio('cardplayed').play();
    target=enemy;
    tcount++;
    select=false;
    g.clear();
    //energy being subtracted
    currentplayer.energy -= 2;
    energytext.text = "Energy: "+currentplayer.energy;
    layout();
    checkroundend();
  }
}
function bgclick(){
  if(select && intro < 0){
    backwardLayout(attacks.children[currentAttack]);
    select = false;
    cattack = [];
    inputrdy=true;
    g.clear();
  }
}
function update() {
  if (game.input.activePointer.leftButton.isDown && intro > 0 && inputrdy)    {
    inputrdy=false;
        intro--;

    switch (intro) {
      case 1://enemies
      game.add.audio('cardplayed').play();
      nextwave();
      franklin.frame++;
      var tt = game.add.tween(franklin).to({x: 300, y:230}, 500, Phaser.Easing.Bounce.Out, true);
      tt.onComplete.add(function() {
        inputrdy = true;
      });
      break;
      case 2://great tree
      game.world.bringToTop(franklin);
      game.add.audio('cardplayed').play();
      franklin.frame++;
      var tt = game.add.tween(franklin).to({x: -50, y:500}, 500, Phaser.Easing.Bounce.Out, true);
      tt.onComplete.add(function() {
        inputrdy = true;
      });
      break;
      case 3://attack cards
      game.add.audio('cardplayed').play();
      initattacks();
      franklin.frame++;
      var tt = game.add.tween(franklin).to({x: 300, y:100}, 500, Phaser.Easing.Bounce.Out, true);
      tt.onComplete.add(function() {
        inputrdy = true;
      });
      break;
      case 4://animal card
      game.add.audio('cardplayed').play();
      initanimals();
      franklin.frame++;
      var tt = game.add.tween(franklin).to({x: 300, y:500}, 500, Phaser.Easing.Bounce.Out, true);
      tt.onComplete.add(function() {
        inputrdy = true;
      });
      break;
      case 5:
      franklin.frame++;
      game.time.events.add(Phaser.Timer.SECOND, function(){inputrdy=true;}, this);
      break;
      case 6:
      franklin.frame++;
      game.time.events.add(Phaser.Timer.SECOND, function(){inputrdy=true;}, this);
      break;
      case 7:
      logo.music.volume = 0.02;
      var t = game.add.tween(logo).to({alpha: 0}, 1000, Phaser.Easing.Linear.Out, true);
      t.onComplete.add(function() {
        logo.destroy();
        franklin = game.add.sprite(-80,500,'turtle');
        franklin.scale.setTo(0.6,0.6);
        franklin.alpha=0;
        franklin.frame=0;
        var tt = game.add.tween(franklin).to({alpha: 1}, 1000, Phaser.Easing.Linear.Out, true);
        tt.onComplete.add(function() {
          inputrdy = true;
        });
      });
      break;
    }

    if(intro === 0){
      var t = game.add.tween(franklin.scale).to({x:0.001,y:0.001}, 1000, Phaser.Easing.Linear.Out, true);
      t.onComplete.add(function() {
      franklin.destroy();
      intro--;
      inputrdy=true;
    });
    }
  }
  else if(intro<0){
    for (i = 0; i < attacks.children.length; i++) {
        if (attacks.children[i].input.pointerOver() && !(contains(cattack, i)) && inputrdy) {
            attacks.children[i].input.enableDrag(true); //enabling drag effects
            attacks.children[i].events.onDragStop.add(onDragStop, this);
            attacks.children[i].scale.setTo(1.3, 1.3);
        } else {
            attacks.children[i].scale.setTo(1, 1);
        }
    }
    if(select){
      g.clear();
      g.lineStyle(10, 0x660202, 20);
      g.moveTo(sl.x, sl.y);
      g.lineTo(game.input.mousePointer.x, game.input.mousePointer.y);
      for (i = 0; i < wave.children.length; i++) {
          if (wave.children[i].input.pointerOver()) {
              wave.children[i].tint = 0xFF0000;
          } else {
              wave.children[i].tint = 0xffffff;
          }
      }
    }
  }
}
