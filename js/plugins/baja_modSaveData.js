// by bajamaid i know its very rough sorry
// PLUGIN PARAMETERS THAT GO IN modsavedata.YAML
// modId: MUST BE THE ID OF YOUR MOD!
// saveName: The name the plugin will give to your saves when mod isn't active (optional)
// dummyFace: The face the game will default to when mod isn't active (optional, must be a file in vanilla img/faces)

hasModSaveFile = function() {
    let yamlData = LanguageManager._data.en.text;
    if (Object.keys(yamlData).includes('modsavedata')) {
        return true;
    }
    else {
        return false;
    };

};

Game_Actor.prototype.faceSaveLoadOriginal = function() {
  var actor = this.actor();
  // When changing these the .png should not be required.
  switch (actor.id) {
    case 1: // Omori
    return "01_OMORI_BATTLE";
    case 2: // Aubrey
    return "02_AUBREY_BATTLE";
    case 3: // Kel
    return "03_KEL_BATTLE";
    case 4: // Hero
    return "04_HERO_BATTLE";
    case 8: // Omori
    return "01_FA_OMORI_BATTLE";
    case 9: // Aubrey
    return "02_FA_AUBREY_BATTLE";
    case 10: // Kel
    return "03_FA_KEL_BATTLE";
    case 11: // Hero
    return "04_FA_HERO_BATTLE";
    default:
      return "default_face_image_here"; // if ther is one?
  }
};

saveFileFaceExists = function(faceImage) {
  const fs = require('fs');
  const path = require("path");
  const base = path.dirname(process.mainModule.filename);
  if (fs.existsSync(`${base}/img/faces/${faceImage}.png`) || fs.existsSync(`${base}/img/faces/${faceImage}.rpgmvp`)) {
   return true;
  } else {
    return false;
  };
};

isModSaveFace = function() {
  if (!actor) {
    var actor = $gameParty.leader();
  };
  if (actor.faceSaveLoad() === 'default_face_image_' || actor.faceSaveLoad() !== actor.faceSaveLoadOriginal()) {
    return true;
  } else {
    return false;
  };

};


// This is dumb and I'm only doing it because people repackage saveloadplus
hasSVPlus = false;
if (typeof Scene_OmoriFile.prototype.createCommandHints=== "function") {
    hasSVPlus = true;
};

if (hasSVPlus) {



    Window_OmoriFileInformation.prototype.refresh = function(valid, info, id) {
        console.log("refresh mod")
        // Clear Contents
        this.contents.clear();
        // Get Color
        var color = 'rgba(255, 255, 255, 1)';
        // Get ID
        //var id = this._index + 1;
        //var valid = DataManager.isThisGameFile(id);
        //var info = DataManager.loadSavefileInfo(id);
      
        // Draw Lines
        this.contents.fillRect(0, 29, this.contents.width, 3, color);
      
        for (var i = 0; i < 3; i++) {
          var y = 55 + (i * 25)
          this.contents.fillRect(113, y, this.contents.width - 117, 1, color);
        };
      
      
        // Draw File
        this.contents.fontSize = 30;
        if(this._columns === 1)this.contents.drawText('FILE ' + id + ':', 10 + 30, -5, 100, this.contents.fontSize);
        else{
          if(!valid || info.saveName === null || info.saveName === "" ||info.saveName === undefined)this.contents.drawText(id, 2, -5, 100, this.contents.fontSize, 'center');
          else this.contents.drawText(info.saveName, 2, -5, 98, this.contents.fontSize, 'center');
        }
        
        // If Valid
        if (valid) {
          if(this._select){
            this._faceSprite.visible = true;
            this._selectedBG.visible = true;
          }else{
            this._faceSprite.visible = false;
            this._selectedBG.visible = false;
          }
            this.contents.drawText(info.realChapter && $modLoader.knownMods.has(info.actorData.modId) ? info.realChapter : info.chapter, 85 + 30 + 13*Math.floor(Math.log10(id)), -5, this.contents.width, this.contents.fontSize);
        
            this.contents.fontSize = 28;
        
            let backBitmap = ImageManager.loadSystem('loadscreen_backgrounds');
            let width = 100;
            let height = 100;
            // this.contents.blt(backBitmap, 0, 0, width, height, 0, 34, width + 10, height);
            bgLocation = getBackground(info.location);
            this.contents.blt(backBitmap, width*bgLocation[0], height*bgLocation[1], width, height, 1, 33); //width*n, height*m controls background
            this._selectedBG.setFrame(width*bgLocation[0], height*bgLocation[1], width, height);
            // Get Actor
            var actor = info.actorData;
            // Draw Actor Face
            let faceSpriteData = actor.realFaceName && saveFileFaceExists(actor.realFaceName) ? actor.realFaceName : actor.faceName;
            if (!saveFileFaceExists(actor.faceName)) {
              faceSpriteData = "01_FA_OMORI_BATTLE";
            };
            //console.log(actor);
            this.drawFace(faceSpriteData, 0, -2, this.contents.height - Window_Base._faceHeight + 7, Window_Base._faceWidth, height - 2);
            this._faceSprite.actor = actor;
            if(omoDelete)this._faceSprite.setAnimRow(4);
            else this._faceSprite.setAnimRow(0);
            // Draw Actor Name
            this.contents.fontSize = 24;
            if(info.saveName === null || info.saveName === "" || info.saveName === undefined)this.contents.drawText(actor.name, 118, 30, 200, 24);
            else this.contents.drawText(info.saveName, 118, 30, 200, 24);
            // Draw Level
            this.contents.drawText('LEVEL:', 290 + 55, 30, 100, 24);
            this.contents.drawText(actor.level, 290 + 55, 30, 70, 24, 'right');
            // Draw Total PlayTime
            this.contents.drawText('TOTAL PLAYTIME:', 118, 55, 200, 24);
            this.contents.drawText(info.playtime, 295 + 55, 55, 100, 24);
            // Draw Location
            this.contents.drawText('LOCATION:', 118, 80, 200, 24);
            this.contents.drawText(info.location, 205, 80, 210, 24, 'right');
          }else{
            this._faceSprite.visible = false;
            this._selectedBG.visible = false;
          };
      
        // Draw Border
        this.contents.fillRect(102, 32, 3, 102, 'rgba(255, 255, 255, 1)')
        this.contents.fillRect(0, 29, 108, 3, 'rgba(255, 255, 255, 1)')
      };

} else {
  
  // Changes 03/10/24: "TDS you are so fucking stupid what is your problem" edition

  Scene_OmoriFile.prototype.loadReservedBitmaps = function() {
    // Super Call
    Scene_Base.prototype.loadReservedBitmaps.call(this);
    // Go through save files
    for (var i = 1; i < 5; i++) {
      // Get Save Info
      const info = DataManager.loadSavefileInfo(i);
      // If Information Exists
      if (info) {
        // Get Actor Data
        const actor = info.actorData;
        // Reserve Face Image
        if (saveFileFaceExists(actor.faceName)) {
          ImageManager.reserveFace(actor.faceName, actor.faceIndex, this._imageReservationId);
        };
        if (actor.realName && saveFileFaceExists(actor.realName)) {
          ImageManager.reserveFace(actor.realName, actor.faceIndex, this._imageReservationId);
        };
        ImageManager.reserveFace("01_FA_OMORI_BATTLE", actor.faceIndex, this.imageReservationId);
      };
    }
  
    ImageManager.reserveSystem('faceset_states', 0, this._imageReservationId);
    ImageManager.reserveParallax('polaroidBG_BS_sky', 0, this._imageReservationId);

    
  };

    //=============================================================================
    // * Refresh
    //=============================================================================
    Window_OmoriFileInformation.prototype.refresh = function() {
        // Clear Contents
        this.contents.clear();
        // Get Color
        var color = 'rgba(255, 255, 255, 1)';
        // Get ID
        var id = this._index + 1;
        var valid = DataManager.isThisGameFile(id);
        var info = DataManager.loadSavefileInfo(id);
    
        // Draw Lines
        this.contents.fillRect(0, 29, this.contents.width, 3, color);
        for (var i = 0; i < 3; i++) {
            var y = 55 + (i * 25)
            this.contents.fillRect(113, y, this.contents.width - 117, 1, color);
        };
    
    
        // Draw File
        this.contents.fontSize = LanguageManager.getMessageData("XX_BLUE.Window_OmoriFileInformation").refresh_contents_fontsize;
        let loc_position = LanguageManager.getMessageData("XX_BLUE.Window_OmoriFileInformation").file_position
        this.contents.drawText(LanguageManager.getMessageData("XX_BLUE.Omori_Save_Load").file.format(id), loc_position[0], loc_position[1], 100, this.contents.fontSize);
        // If Valid
        if (valid) {
            loc_position = LanguageManager.getMessageData("XX_BLUE.Window_OmoriFileInformation").refresh_drawText_position;
            let chap = LanguageManager.getMessageData("XX_BLUE.Chapter_Names")[info.chapter]
            if(!chap) {
                chap = info.chapter
            }
            this.contents.drawText(info.realChapter && $modLoader.knownMods.has(info.actorData.modId) ? info.realChapter : chap, loc_position[0], loc_position[1], this.contents.width, this.contents.fontSize);
            this.contents.fontSize = 28;
        
            let backBitmap = ImageManager.loadSystem('faceset_states');
            let width = backBitmap.width / 4;
            let height = backBitmap.height / 5;
            // this.contents.blt(backBitmap, 0, 0, width, height, 0, 34, width + 10, height);
            this.contents.blt(backBitmap, 0, 0, width, height, 1, 33);
            // Get Actor
            var actor = info.actorData
            // Draw Actor Face
            if (actor.realFaceName && saveFileFaceExists(actor.realFaceName)) {
                let bit = ImageManager.loadFace(actor.realFaceName);
                bit.addLoadListener(() => this.drawFace(actor.realFaceName, actor.faceIndex, -2, this.contents.height - Window_Base._faceHeight + 7, Window_Base._faceWidth, height - 2));
            } else if (saveFileFaceExists(actor.faceName)){
              let bit = ImageManager.loadFace(actor.faceName);
              bit.addLoadListener(() => this.drawFace(actor.faceName, actor.faceIndex, -2, this.contents.height - Window_Base._faceHeight + 7, Window_Base._faceWidth, height - 2));
            } else {
                let bit = ImageManager.loadFace("01_FA_OMORI_BATTLE");
                bit.addLoadListener(() => this.drawFace("01_FA_OMORI_BATTLE", actor.faceIndex, -2, this.contents.height - Window_Base._faceHeight + 7, Window_Base._faceWidth, height - 2));
            };
            // Draw Actor Name
            this.contents.fontSize = 24;
            this.contents.drawText(actor.name, 118, 30, 100, 24);
            // Draw Level
            loc_position = LanguageManager.getMessageData("XX_BLUE.Window_OmoriFileInformation").level_position;
            this.contents.drawText(LanguageManager.getMessageData("XX_BLUE.Omori_Save_Load").level, loc_position[0], loc_position[1], 100, 24);
            this.contents.drawText(actor.level, loc_position[0], loc_position[1], 70, 24, 'right');
            // Draw Total PlayTime
            loc_position = LanguageManager.getMessageData("XX_BLUE.Window_OmoriFileInformation").playtime_position;
            this.contents.drawText(LanguageManager.getMessageData("XX_BLUE.Omori_Save_Load").playtime, 118, 55, 200, 24);
            this.contents.drawText(info.playtime, loc_position[0], loc_position[1], 100, 24);
            // Draw Location
            this.contents.drawText(LanguageManager.getMessageData("XX_BLUE.Omori_Save_Load").location, 118, 80, 200, 24);
            this.contents.drawText(info.location, 205, 80, 210, 24, 'right');
        };
    
        // Draw Border
        this.contents.fillRect(102, 32, 3, 102, 'rgba(255, 255, 255, 1)')
        this.contents.fillRect(0, 29, 108, 3, 'rgba(255, 255, 255, 1)')
    };

};




DataManager.makeSavefileInfo = function() {
    // Get Original Info
    var info = _TDS_.OmoriSaveLoad.DataManager_makeSavefileInfo.call(this);
    if ($gameSwitches.value(1966)) {
      if ($gameVariables.value(22) === 1) {
        failsafeFaceName = "02_FA_AUBREY_BATTLE";
      } else {
        failsafeFaceName = "01_FA_OMORI_BATTLE";
      };
    } else {
      failsafeFaceName = "04_FA_HERO_BATTLE";
    };
    // Get Leader
    var actor = $gameParty.leader();
    if (hasModSaveFile()) {
        info.actorData = {modId: LanguageManager.getMessageData("modsavedata.data").modId, name: LanguageManager.getMessageData("modsavedata.data").saveName || LanguageManager.getMessageData("modsavedata.data").modId.toUpperCase() + " SAVE FILE", realName: actor.name(), level: actor.level, faceName: LanguageManager.getMessageData("modsavedata.data").dummyFace || failsafeFaceName, realFaceName: actor.faceSaveLoad(), faceIndex: actor.faceSaveLoadIndex()};
        if (LanguageManager.getMessageData("modsavedata.data").saveName === "chapter") {
          info.chapter = $gameVariables.value(23);
        } else {
          info.chapter = LanguageManager.getMessageData("modsavedata.data").saveName || LanguageManager.getMessageData("modsavedata.data").modId.toUpperCase() + " SAVE FILE";
          info.realChapter = $gameVariables.value(23);
        };
    }
    else if (isModSaveFace()) {
        info.actorData = {name: actor.name(), level: actor.level, faceName: failsafeFaceName, realFaceName: actor.faceSaveLoad(), faceIndex: actor.faceSaveLoadIndex()};
        info.chapter = $gameVariables.value(23);
    } else {
      info.actorData = {name: actor.name(), level: actor.level, faceName: actor.faceSaveLoad(), faceIndex: actor.faceSaveLoadIndex()};
      info.chapter = $gameVariables.value(23);
    };
    info.location = $gameMap.displayName();
    info.saveName = $gameSystem.saveName;
    // Return Info
    return info;
};

Window_OmoriFileStats.prototype.updateStats = function (valid, info, id) {
    this.contents.clear();
    this.contents.fontSize = 30;
    this.contents.drawText('FILE ' + id + ':', 1, 1, 130, this.contents.fontSize, 'center');
    if (valid) {
      var actor = info.actorData;
      this.contents.drawText(info.realChapter && $modLoader.knownMods.has(actor.modId) ? info.realChapter : info.chapter, 1, 31, 130, this.contents.fontSize, 'center');
      // Draw Actor Name
      this.contents.fontSize = 24;
      // Draw Level
      this.contents.drawText('LEVEL: '+actor.level, 1, 67, 130, 24, 'center');
      // Draw Total PlayTime
      this.contents.drawText('PLAYTIME:', 1, 93, 130, 24, 'center');
      this.contents.drawText(info.playtime, 1, 117, 130, 24, 'center');
      // Draw Location
      this.contents.drawText('LOCATION:', 1, 143, 130, 24, 'center');
      this.contents.drawText(info.location, 1, 167, 130, 24, 'center');
    }
    var color = 'rgba(255, 255, 255, 1)';
    this.contents.fillRect(0, 64, this.contents.width, 3, color);
    this.contents.fillRect(8, 92, this.contents.width - 16, 1, color);
    this.contents.fillRect(8, 142, this.contents.width - 16, 1, color);
    this.contents.fillRect(8, 191, this.contents.width - 16, 1, color);
};


Sprite_OmoSaveMenuFace.prototype.updateBitmap = function() {
    // Get Actor
    var actor = this.actor
    // If Actor Exists and it has Battle Status Face Name
    if (actor) {
      let faceName = actor.realFaceName && saveFileFaceExists(actor.realFaceName) ? actor.realFaceName : actor.faceName
      // Set Bitmap
      if (faceName !== actor.realFaceName && !saveFileFaceExists(actor.faceName)) {
        this.bitmap = ImageManager.loadFace("01_FA_OMORI_BATTLE");
      } else {
        this.bitmap = ImageManager.loadFace(faceName);
      };
    } else {
      this.bitmap = null;
    };
    // Update Frame
    this.updateFrame();
};

Game_Actor.prototype.faceSaveLoad = function() {
  var actor = this.actor();
  if (actor.meta.BattleStatusFaceName) {
    return actor.meta.BattleStatusFaceName.trim();
  } else {
    return "01_FA_OMORI_BATTLE";
  };
};

function getBackground(location){
  switch(location){
    case "ORANGE OASIS":
      return [1,0];
    case "BLACK SPACE":
      return [2,0];
    case "PINWHEEL FOREST":
      return [3,0];
    case "VAST FOREST":
      return [3,1];
    case "FOREST PLAYGROUND":
      return [0,2];
    case "OTHERWORLD":
      return [2,1];
    case "JUNKYARD":
      return [1,2];
    case "LAST RESORT":
      return [0,1];
    case "DEEPER WELL":
      return [1,1];
    case "HUMPHREY":
      return [2,2];
    case "RAIN TOWN":
      return [3,2];
    case "SNOWGLOBE MOUNTAIN":
      return [0,3];
    case "FROZEN LAKE":
      return [1,3];
    case "BACKSTAGE":
      return [2,3];
    case "SPROUT MOLE VILLAGE":
      return [3,3];
    case "LOST LIBRARY":
      return [0,4];
    case "SWEETHEART'S CASTLE":
      return [1,4];
    case "PYREFLY FOREST":
      return [2,4];
    case "UNDERWATER HIGHWAY":
      return [3,4];
    case "BOSS RUSH":
      return [4,0];
    case "BASIL'S HOUSE":
      return [4,1];
    case "FARAWAY PARK":
      return [4,2];
    case "OUTSIDE":
      return [4,3];
    case "RECYCULTIST'S HQ":
      return [4,4];
    case "MOM'S ROOM":
      return [0,5];
    case "LOST FOREST":
      return [1,5];//i still need pictures of this :<
    case "NEIGHBOR'S ROOM":
      return [2,5];//i still need pictures of this :<
    case "THE ABYSS":
      return [3,5];
    case "MARI'S FIELD":
      return [1, 5];
    case "SPACESHIP":
      return [2, 5];
    default:
      return [0,0];

  }}

  
var old_Scene_OmoriFile_prototype_loadReservedBitmaps = Scene_OmoriFile.prototype.loadReservedBitmaps;
Scene_OmoriFile.prototype.loadReservedBitmaps = function() {
  old_Scene_OmoriFile_prototype_loadReservedBitmaps.call(this);
};