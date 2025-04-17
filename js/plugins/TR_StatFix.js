//=============================================================================
 /*:
 * @author TomatoRadio
 * @plugindesc
 * Adds EVASION as a stat in menus and stuff
 */
//=============================================================================

//=============================================================================
// * Object Initialization
//=============================================================================
Window_OmoMenuEquipStatus.prototype.initialize = function() {
  // Super Call
  Window_Base.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
  // Create Bubble Sprites
  this.createBubbleSprites();   
  // Parameters to draw (Use 100+ for Xparam, 200+ For Sparam)
  this._params = [0,1,2, 3, 6, 7, [100, 8], [101, 9]];
  // Set Actor & Temp actor to null
  this._actor = null; this._tempActor = null
  // Set Openness to 0
  this.openness = 0; 
  // Refresh
  this.refresh();
};
//=============================================================================
// * Refresh
//=============================================================================
Window_OmoMenuEquipStatus.prototype.refresh = function() {
  // Clear Contents
  this.contents.clear();
  // Get Actor
  var actor = this._actor;
  // If Actor Exists
  if (actor) {
    // Get Arrow Bitmap
    var bitmap = ImageManager.loadSystem('equip_arrow');  
    // Stats (Use 100+ for Xparam, 200+ For Sparam)
    var stats = this._params;
    // Go Through Stats
    for (var i = 0; i < stats.length; i++) {
      // Get Param Index
      var paramIndex = stats[i];
      var paramSub = Array.isArray(paramIndex) ? paramIndex[1] : null;
      if (paramSub) { paramIndex = paramIndex[0]; }
      // Get First Value
      var value1 = Math.floor(this.actorParamValue(actor, paramIndex));
      // Get Param Name
      var paramName = TextManager.param(paramSub ? paramSub : paramIndex);
      if(paramName.toLowerCase() === "max hp") {paramName = "HEART";}
      if(paramName.toLowerCase() === "max mp") {paramName = "JUICE";}
      this.contents.fontSize = 20;    
      this.drawText(paramName.toUpperCase() + ':', 8, -5 + i * 18, 100)    
      this.drawText(value1, 132, -5 + i * 18, 100)
      this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 173, 13 + i * 18)
      // If Temp Actor Exists
      if (this._tempActor) {
        var value2 = Math.floor(this.actorParamValue(this._tempActor, paramIndex));
        this.resetTextColor();
        if (value1 < value2) {  this.contents.textColor = "#69ff90";}
        if (value1 > value2) {  this.contents.textColor = "#ff2b2b";}        
      } else {
        var value2 = '---';
      }
      this.drawText(value2, 132 + 56, -5 + i * 18, 100)
      this.resetTextColor();      
    };
  };
};

//This fixes evasion and hitrate being seperate stats in calculations. Now evasion will reduce the hitrate of the attacker
Game_Action.prototype.itemHit = function(target) {
    if (this.isPhysical()) {
        return this.item().successRate * 0.01 * this.subject().hit - target.eva;
    } else {
        return this.item().successRate * 0.01;
    }
};

Game_Action.prototype.itemEva = function(target) {
    if (this.isPhysical()) {
        return 0;
    } else if (this.isMagical()) {
        return 0;
    } else {
        return 0;
    }
};