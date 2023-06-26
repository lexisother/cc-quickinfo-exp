sc.AlyxEnemyBaseParamLine = sc.EnemyBaseParamLine.extend({
  alyGfx: new ig.Image('media/gui/aly.png'),
  srcX: null,
  srcY: null,
  init(label, x, y) {
    this.parent(label);
    this.srcX = x;
    this.srcY = y;
  },
  updateDrawables(renderer) {
    renderer.addGfx(this.gfx, 0, 0, 520, 48, 118, 11);
    renderer.addGfx(this.alyGfx, 0, 0, this.srcX, this.srcY, 11, 11);
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
    this.exp = this.createAlyxStatusLine('EXP', 4, 77, 0, 0);
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
  createAlyxStatusLine(label, x, y, srcX, srcY) {
    let paramLine = new sc.AlyxEnemyBaseParamLine(label, srcX, srcY);
    paramLine.setPos(x, y);
    this.addChildGui(paramLine);
    return paramLine;
  },
});
