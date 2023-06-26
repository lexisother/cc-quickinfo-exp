// HACK: Too lazy to write langfile patches right now.
ig.Lang.inject({
  get(label) {
    let temp = this.parent(label);
    return temp != 'UNKNOWN LABEL' ? temp : label.split('.').slice(-1);
  },
});

// Quick injection to allow additional Y values for selecting other icon rows
sc.EnemyBaseParamLine.inject({
  additionalY: 0,
  init(a, b, c = 0) {
    this.parent(a, b);
    this.additionalY = c;
  },
  updateDrawables(a) {
    a.addGfx(this.gfx, 0, 0, 520, 48, 118, 11);
    a.addGfx(
      this.gfx,
      0,
      0,
      sc.MODIFIER_ICON_DRAW.X + this.icon * 12,
      sc.MODIFIER_ICON_DRAW.Y + this.additionalY, // only change from original func
      11,
      11,
    );
  },
});

sc.QUICK_INFO_BOXES.Enemy.inject({
  exp: null,
  init() {
    this.parent();
    // default sizes are `127, 140`, so give it a little nudge for our extra status line
    this.setSize(127, 154);

    // 77 was chosen because the game starts with 21 (for the first line), then
    //    adds 14 per additional status line (there's 3 more), which results in
    //    63, +14 for ours.
    this.exp = this.createStatusLine('exp', 4, 4, 77, 12);

    // Nudge this downwards a little to give space to our status line
    this.resistance.setPos(4, 95);
  },
  setData(enemy, entity) {
    // Just construct the other data normally...
    this.parent(enemy, entity);

    // Contains the enemy data as specified by the entity JSON file
    let enemyData = sc.combat.enemyDataList[enemy];

    // Then add the additional data just like the game does...
    let cond = new ig.VarCondition();
    cond.setCondition(enemyData.hideStats || 'false');
    if (cond.evaluate()) {
      this.exp.number.scramble = true;
      this.exp.setNumber(999, true);
    } else {
      // Small bit of invesigation done here: <https://discord.com/channels/382339402338402315/382339402338402317/1122839677934772275>
      let expToGive = sc.PlayerLevelTools.computeExp(
        entity.enemyType.exp,
        sc.model.player.level,
        enemyData.level,
        void 0,
        void 0,
        sc.LEVEL_CURVES.REGULAR,
      );

      this.exp.number.scramble = false;
      this.exp.setNumber(expToGive, true);
    }
  },
  createStatusLine(label, icon, x, y, additionalIconDrawY) {
    let paramLine = new sc.EnemyBaseParamLine(
      ig.lang.get('sc.gui.menu.equip.' + label),
      icon,
      additionalIconDrawY,
    );
    paramLine.setPos(x, y);
    this.addChildGui(paramLine);
    return paramLine;
  },
});
