//=============================================================================
 /*:
 * @plugindesc Modifies the ENERGY system to be more active
 * @author TomatoRadio (Built off code from Matthiew Purple & ReynStahl)
 * @help
 *
 * ENERGY is now charged by damage and goes up to 20!
 *
 * ======== EXAMPLE FUNCTIONS ========
 * <EnergyChargePower: #> Multiplies the energy that would be gained (or lost) by this number. Please use an integer.
 */
 //=============================================================================


!function() {
    //Raises the energy bar's maximum to 20
    Object.defineProperty(Game_Party.prototype, 'stressEnergyCount', {get: function() {return this._stressEnergyCount;}, set: function (value) {this._stressEnergyCount = value.clamp(0, 20);}, configurable: true});

    
    //Makes sure the energy bar can be properly displayed avec 10
    let old_Sprite_StressBar_prototype_drawStressCountValue = Sprite_StressBar.prototype.drawStressCountValue;
    Sprite_StressBar.prototype.drawStressCountValue = function (value = this._ekgRow) {
        if ($gameTroop._troopId == 451) {
            //Work normally
            old_Sprite_StressBar_prototype_drawStressCountValue.call(this, value = this._ekgRow);
            return;
        }
        // Clear Text
        this._ekgText.bitmap.clear();
        // Refresh EKG Bitmap
        this._ekgText.bitmap.drawText(value.clamp(0, 20).padZero(2), 0, -4, this._ekgText.bitmap.width, this._ekgText.bitmap.height, 'center');
    };


    //Adds all the conditions of the new energy system
    let old_Game_Action_prototype_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function (target) {
        if ($gameTroop._troopId == 451) {
            //Work normally
            old_Game_Action_prototype_apply.call(this, target);
            return;
        }
        console.log("Nope, not BASIL...");
        // Run Original Function
        _TDS_.OmoriBattleSystem.Game_Action_apply.call(this, target);
        // Get Result
        let result = target.result();
        // Check iff hit
        let hit = result.isHit();
    
        let critical = result.critical;
    
        // If Hit
        if (hit) {
            // Get Element Rate
            let elementRate = this.calcElementRate(target);
    
            // Set elemental results
            result.elementStrong = elementRate > 1;
            result.elementWeak = elementRate < 1;
            if (result.hpDamage > 0) {
                if (!!result.critical) {
                    AudioManager.playSe({name: "BA_CRITICAL_HIT", volume: 250, pitch: 100, pan: 0});
                } else if (result.elementStrong) {
                    AudioManager.playSe({name: "se_impact_double", volume: 150, pitch: 100, pan: 0});
                } else if (result.elementWeak) {
                    AudioManager.playSe({name: "se_impact_soft", volume: 150, pitch: 100, pan: 0});
                } else {
                    SoundManager.playEnemyDamage();
                }
            }
        }
        ;
        let is_dull = result.elementWeak
        let is_moving = result.elementStrong //These probably won't see use due to the nuking of emotional advantages
		//OVERCHARGED ADDITIONS//
		let item = this.item();
		let user = this.subject();
		let charge = item.meta.EnergyChargePower === undefined ? 1 : Number(item.meta.EnergyChargePower); //For ENERGIZER
		let happycharge = 1; // Being Happy doubles charge power
		if (user.isStateAffected(6 || 7 || 8 || 197 || 122 || 123)) {
			happycharge = 2
		} else {
			happycharge = 1
		};
		let is_sad = target.isStateAffected(10 || 11 || 12 || 124 || 125 || 126)
		//OVERCHARGED ADDITIONS//
        // If Target is an enemy
        if (target.isEnemy()) {
            // Get Item
            let item = this.item();
            // If result was a hit
            if (hit) {
                // If scanning enemy
                if (item && item.meta.ScanEnemy && target.canScan()) {
                    // Scan Enemy
                    $gameParty.addScannedEnemy(target.enemyId());
                }
    
                // If HP damage is more than 0
                if (result.hpDamage > 0) {
    
                    /*
                    Moving: +3
                    Dull: -3
                    Neutral Critical: +3
                    Neutral Normal : +1
                    */
			if (is_moving || is_dull || critical || is_sad) {
                        if (is_moving) $gameParty.stressEnergyCount += 3
						else if (is_sad) $gameParty.stressEnergyCount += 1 //If an enemy is sad you cant gain more than 1 energy off them
                        else if (is_dull) $gameParty.stressEnergyCount -= 3
                        else if (critical) $gameParty.stressEnergyCount += 2 * charge * happycharge
                    } else {
                        $gameParty.stressEnergyCount += 1 * charge * happycharge
                    }
                }
    
            } else {
                //If miss: -3 energy
                $gameParty.stressEnergyCount -= 3;
            }
        } else {
            // If result was a hit
            if (hit) {
    
                // If HP damage is more than 0
                if (result.hpDamage > 0) {
    
                    /*
                    Moving: -3
                    Dull: -0
                    Neutral Critical: -3
                    Neutral Normal : -1
                    */
                    if (!target.isStateAffected(2)){ //Guarding will always prevent the ENERGY from decreasing
                        if (critical || is_moving || is_dull || is_sad) {
                            if (is_moving) $gameParty.stressEnergyCount -= 3
							else if (is_sad) $gameParty.stressEnergyCount -= 1 //You cant lose more than 1 energy if you are sad
                            else if (is_dull) $gameParty.stressEnergyCount -= 0
                            else if (critical) $gameParty.stressEnergyCount -= 2 * charge * happycharge 
                        } else {
                            $gameParty.stressEnergyCount -= 1 * charge * happycharge
                        }
                    }
                }
            }
        }
    
        // Reset energy
        if ($gameParty.stressEnergyCount < 0) $gameParty.stressEnergyCount = 0;
        if ($gameParty.stressEnergyCount > 20) $gameParty.stressEnergyCount = 20;
        if ($gameParty.inBattle()) {
            if (!BattleManager._logWindow._activeChainSkill) BattleManager._statusWindow.refreshACS();
        }
    }


    //Makes battles start with 0 ENERGY
    let old_BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function () {
        if ($gameTroop._troopId == 451) {
            //Work normally
            old_BattleManager_startBattle.call(this);
            return;
        }
        // Run Original Function
        _TDS_.OmoriBattleSystem.BattleManager_startBattle.call(this);
        // Increase Stress Count
        $gameParty.stressEnergyCount = 3;
        // Set Default Picture Display Layer
        this.setPictureDisplayLayer('top');
    
        // Get Scene
        const scene = SceneManager._scene;
        const spriteset = scene._spriteset;
        // Set Container
        let container = spriteset._pictureContainer;
        // Move Fade Layer to Scene
        scene.addChild(spriteset._fadeSprite);
    };


    //Properly displays the RELEASE ENERGY bubble
    Window_OmoriBattleActorStatus.prototype.setupACSBubbles = function (list) {
        // Get Actor
        var actor = this.actor();
        this._lastACSList = list;
        for (var i = 0; i < this._acsBubbleSprites.length; i++) {
            // Get Skill
            var data = list[i];
            // Get Bubble
            var bubble = this._acsBubbleSprites[i];
            // Update Position
            bubble.updatePosition(i);
            // If Data
            if (data) {
                // Get Skill
                var skill = data[1];
                // Bubble Index
                var bubbleIndex = skill.meta.ChainSkillIcon === undefined ? 0 : Number(skill.meta.ChainSkillIcon);
                // If Skill is Chain Skill Energy Release And Energy is at max
                if (skill.meta.ChainSkillEnergyRelease && $gameParty.stressEnergyCount >= 20) {
                    // Change Index
                    bubbleIndex = $gameParty.size() === 1 ? 3 : 2;
                    bubble.startShake();
                } else {
                    bubble.stopShake();
                }
                ;
                // Set Bubble Index
                bubble.setBubbleIndex(bubbleIndex);
                bubble.setArrowDirection(data[0]);
                actor.canUse(skill) ? bubble.activate() : bubble.deactivate();
            }
            ;
        }
        ;
    };

    Window_OmoriBattleActorStatus.prototype.updateACSBubbleStatus = function() {
        let actor = this.actor()
        if (this._lastACSList) {
          for (const [i, bubble] of this._acsBubbleSprites.entries()) {
            let data = this._lastACSList[i]
            if (data) {
              let skill = data[1]
              actor.canUse(skill) ? bubble.activate() : bubble.deactivate()
            }
          }
        }
      }
      Window_BattleStatus.prototype.refreshACS = function() {
        for (const win of this._faceWindows) {
          win.updateACSBubbleStatus()
        }
      }
	
	Sprite_StressBar.prototype.updateBackgroundImage = function() {
	// Get Background Name
	let backgroundName = 'StressBar_DreamWorld';
	// Set Index to 0
	let index = 0;
	// Set Default Rows
	let rows = 5;
	// Get Stress
	let stress = $gameParty.stressEnergyCount;
	
	if ($gameParty.actorIsAffectedByState(1, 20) || $gameParty.actorIsAffectedByState(8, 20)) {
		stress = 10;
	}
	
	switch ($gameVariables.value(22)) {
		case 1:
		// Set Index
		rows = 5;
		if (stress >= 16) {
			index = 4;
		} else if (stress >= 11) {
			index = 3;
		} else if (stress >= 6) {
			index = 2;
		} else if (stress >= 1) {
			index = 1;
		} else {
			index = 0;
		};
		break;
		case 3:
		case 4:
		backgroundName = 'StressBar_BlackSpace';
		rows = 4;
		if (stress === 10) {
			index = 2;
		} else if (stress > 6 && stress < 10) {
			index = 2;
		} else if (stress > 3 && stress <= 6) {
			index = 1;
		} else {
			index = 0;
		};
		break;
	};
	// Get Bitmap
	let bitmap = ImageManager.loadSystem(backgroundName);
	// Get Height
	let height = bitmap.height / rows;
	// Set Background Bitmap	
	this._background.bitmap = bitmap;
	// Set Background Frame
	bitmap.addLoadListener(() => this._background.setFrame(0, index * height, bitmap.width, height));
	};

	Sprite_StressBar.prototype.refreshEKGBitmap = function(index = this._ekgRow) {

	let ekgName = 'energy_stress_ekg_line';
	switch ($gameVariables.value(22)) {
		case 1: ekgName = 'energy_dw_line' ;break;
		case 3: ekgName = 'energy_stress_ekg_line' ;break;
		case 4: ekgName = 'energy_stress_ekg_line' ;break;
	};
	// Get Bitmap
	var bitmap = ImageManager.loadSystem(ekgName);
	// Clear & Transfer Bitmap
	this._ekgLineBitmap.clear();
	if (index > 0) {
	this._ekgLineBitmap.blt(bitmap, 0, Math.ceil(index / 2) * 28, bitmap.width, 28, 0, 0);
	} else {
	this._ekgLineBitmap.blt(bitmap, 0, index * 28, bitmap.width, 28, 0, 0);
	};
	// If Pending EKG Row is valid
	if (this._pendingEKGRow >= 0) {
		this._ekgLineNewBitmap.clear()
		if (this._pendingEKGRow > 0) {
			this._ekgLineNewBitmap.blt(bitmap, 0, Math.ceil(this._pendingEKGRow / 2) * 28, bitmap.width, 28, 0, 0);
		} else {
			this._ekgLineNewBitmap.blt(bitmap, 0, this._pendingEKGRow * 28, bitmap.width, 28, 0, 0);
		};
	};
	
	// if ($gameParty.actorIsAffectedByState(1, 20) || $gameParty.actorIsAffectedByState(8, 20)) {
	//   this._pendingIndex = Math.floor();
	// };
	};
	
Window_Base.prototype.drawEnergyIcon = function(x, y) {
  // Get Icon
  var icon = ImageManager.loadSystem('energy_icon');
  this.contents.blt(icon, 0, 0, icon.width, icon.height, x, y)
};

//This code is modified code from ReynStahl's HPCostIcon plugin, so credits to them for this code.
  // Replace setItem funciton entirely to alter how it displays MP and HP icons.
Window_ItemListBack.prototype.setItem = function(item) {
    // Clear Rect
	ImageManager.loadSystem('energy_icon'); //Preloading the energy icon to prevent flicker
    this.contents.clearRect(0, 0, this.contents.width, 28);
    // If Item
    if (DataManager.isItem(item)) {
      // Set Bitmap Font color to null
      this.contents.bitmapFontColor = null;
      // Draw Item Count
      this.contents.drawText(LanguageManager.getMessageData("XX_BLUE.Omori_Battle_System").hold.format($gameParty.battleNumItems(item)), 6, 2, 100, 20);
    };
    // If Skill
    if (DataManager.isSkill(item)) {
      // Set Bitmap Font color to null
      this.contents.bitmapFontColor = null;
      this.contents.drawText(LanguageManager.getMessageData("XX_BLUE.Omori_Battle_System").cost, 6, 2, 100, 20);

      // ======== Changes icon depending if its Mp or Hp cost ========
      let mpCost = this._actor.skillMpCost(item);
	  let hpCost = this._actor.skillHpCost(item);
      let energyCost = item.meta.EnergyCost == undefined ? 0 : Math.round(Number(item.meta.EnergyCost));
      	  if (hpCost == 0 && mpCost == 0 && energyCost == 0) { //None
		  return; //Returns none bc there is no cost lmao
	  } else {
		if (hpCost > 0) { //Check each case that involves HP
			if (mpCost > 0) { //Mp cost exists
				if (energyCost > 0) { //All
					this.contents.drawText(energyCost, 0, 2, 95, 20, 'right');
					this.drawEnergyIcon(100, 6); 
					this.contents.drawText(mpCost, 50, 2, 95, 20, 'right');
					this.drawMPIcon(150, 6); 
					this.contents.drawText(hpCost, 100, 2, 95, 20, 'right');
					this.drawHPIcon(200, 7);
				} else { //Only HP and MP
					this.contents.drawText(mpCost, 0, 2, 95, 20, 'right');
					this.drawMPIcon(100, 6); 
					this.contents.drawText(hpCost, 50, 2, 95, 20, 'right');
					this.drawHPIcon(150, 7);
				};
			} else { //Only HP
				this.contents.drawText(hpCost, 0, 2, 95, 20, 'right');
				this.drawHPIcon(100, 6); 
			};
		} else { //No HP Cost
			if (mpCost > 0) {//MP Cost exist
				if (energyCost > 0) {//Energy and MP
					this.contents.drawText(energyCost, 0, 2, 95, 20, 'right');
					this.drawEnergyIcon(100, 6); 
					this.contents.drawText(mpCost, 50, 2, 95, 20, 'right');
					this.drawMPIcon(150, 6); 
				} else {//Only MP
					this.contents.drawText(mpCost, 0, 2, 95, 20, 'right');
					this.drawMPIcon(100, 6); 
				};
			} else {//No MP, therefore must be energy
				this.contents.drawText(energyCost, 0, 2, 95, 20, 'right');
				this.drawEnergyIcon(100, 6);
			};
		};
    };
  };
};

BattleManager.endBattle = function(result) {
  $gameParty.stressEnergyCount = 0;
  // Refresh Status
  this.refreshStatus();
  $gameParty.allMembers().forEach(function(actor) {
    actor._hasLeveled = false;
  });
  // Set Hide Low HP overlay flag to true
  this._hideLowHpOverlay = true;
  // Fadeout Battle Music
  if(!BattleManager.isBattleSameOfMapBgm()) {AudioManager.fadeOutBgm(2);}
  AudioManager.fadeOutBgs(2);
  // Fadeout BGS
  AudioManager.fadeOutDangerBgs(1);
  // Run Original Function
  _TDS_.OmoriBattleSystem.BattleManager_endBattle.call(this, result);
  // Stop Using victory face
  $gameParty.allMembers().forEach(function(actor) {
    actor._useVictoryFace = false;
  });
};

}()
