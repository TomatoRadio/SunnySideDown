Window_ChoiceList.prototype.updatePlacement = function() {
  // Run Original Function
  _TDS_.OmoriBASE.Window_ChoiceList_updatePlacement.call(this);
  // Move Window
  if ($gameParty.inBattle()) {
    this.x -= 140; this.y -= 69; }
  else {
    this.x -= 18; this.y -= 8;
  };
  var messageY = this._messageWindow.y;
  if (messageY >= Graphics.boxHeight / 2) {
    this.y -= 4;
  } else {
    this.y += 4;
  };
  // Get Face Window
  var faceWindow = this._messageWindow._faceBoxWindow;
  // Set Position based on face window
  if (!!$gameMessage.faceCount()) { this.x += faceWindow.x; };
};