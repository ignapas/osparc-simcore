/*
 * oSPARC - The SIMCORE frontend - https://osparc.io
 * Copyright: 2019 IT'IS Foundation - https://itis.swiss
 * License: MIT - https://opensource.org/licenses/MIT
 * Authors: Ignacio Pascual (ignapas)
 */

/**
 * @asset(hint/hint.css)
 */

qx.Class.define("osparc.ui.hint.Hint", {
  extend: qx.ui.core.Widget,
  include: [qx.ui.core.MRemoteChildrenHandling, qx.ui.core.MRemoteLayoutHandling],

  construct: function(element, text) {
    this.base(arguments);
    this.set({
      backgroundColor: "transparent",
      visibility: "excluded"
    });

    const hintCssUri = qx.util.ResourceManager.getInstance().toUri("hint/hint.css");
    qx.module.Css.includeStylesheet(hintCssUri);

    this.__createWidget();
    this.__caret.getContentElement().addClass("hint");
    this.__root = qx.core.Init.getApplication().getRoot();
    this.__root.add(this);

    if (element) {
      if (element.getContentElement().getDomElement() == null) { // eslint-disable-line no-eq-null
        element.addListenerOnce("appear", () => this.setElement(element), this);
      } else {
        this.setElement(element);
      }
    }

    // If it is a simple label
    if (text) {
      this.__hintContainer.setLayout(new qx.ui.layout.Basic());
      this.add(new qx.ui.basic.Label(text).set({
        rich: true,
        maxWidth: 250
      }));
    }
  },

  statics: {
    orientation:{
      TOP: 0,
      RIGHT: 1,
      BOTTOM: 2,
      LEFT: 3
    }
  },

  properties: {
    element: {
      check: "qx.ui.core.Widget",
      apply: "_applyElement"
    },
    active: {
      check: "Boolean",
      apply: "_applyActive",
      nullable: false,
      init: true
    },
    orientation: {
      check: "Integer",
      nullable: false,
      init: 1
    }
  },

  members: {
    __hintContainer: null,
    __caret: null,
    __root: null,

    __createWidget: function() {
      this.__hintContainer = this.__hintContainer || new qx.ui.container.Composite().set({
        appearance: "hint"
      });
      this.__caret = this.__caret || new qx.ui.container.Composite().set({
        backgroundColor: "transparent"
      });
      this._removeAll();
      this.__caret.getContentElement().removeClass("hint-top");
      this.__caret.getContentElement().removeClass("hint-right");
      this.__caret.getContentElement().removeClass("hint-bottom");
      this.__caret.getContentElement().removeClass("hint-left");
      switch (this.getOrientation()) {
        case this.self().orientation.TOP:
        case this.self().orientation.LEFT:
          this.__caret.resetWidth();
          this.__caret.setHeight(5);
          this.__caret.getContentElement().addClass(this.getOrientation() === this.self().orientation.LEFT ? "hint-left" : "hint-top");
          this._setLayout(this.getOrientation() === this.self().orientation.LEFT ? new qx.ui.layout.HBox() : new qx.ui.layout.VBox());
          this._add(this.__hintContainer, {
            flex: 1
          });
          this._add(this.__caret);
          break;
        case this.self().orientation.RIGHT:
        case this.self().orientation.BOTTOM:
          this.__caret.resetHeight();
          this.__caret.setWidth(5);
          this.__caret.getContentElement().addClass(this.getOrientation() === this.self().orientation.RIGHT ? "hint-right" : "hint-bottom");
          this._setLayout(this.getOrientation() === this.self().orientation.RIGHT ? new qx.ui.layout.HBox() : new qx.ui.layout.VBox());
          this._add(this.__caret);
          this._add(this.__hintContainer, {
            flex: 1
          });
          break;
      }
    },

    __updatePosition: function() {
      const {
        top,
        left
      } = qx.bom.element.Location.get(this.getElement().getContentElement()
        .getDomElement());
      const {
        width,
        height
      } = this.getElement().getBounds();
      const selfBounds = this.getBounds() || this.getSizeHint();
      let properties = {};
      switch (this.getOrientation()) {
        case this.self().orientation.TOP:
          properties.top = top - selfBounds.height;
          properties.left = Math.floor(left + (width - selfBounds.width) / 2);
          break;
        case this.self().orientation.RIGHT:
          properties.top = Math.floor(top + (height - selfBounds.height) / 2);
          properties.left = left + width;
          break;
        case this.self().orientation.BOTTOM:
          properties.top = top + height;
          properties.left = Math.floor(left + (width - selfBounds.width) / 2);
          break;
        case this.self().orientation.LEFT:
          properties.top = Math.floor(top + (height - selfBounds.height) / 2);
          properties.left = left - selfBounds.width;
          break;
      }
      this.setLayoutProperties(properties);
    },

    // overwritten
    getChildrenContainer: function() {
      return this.__hintContainer;
    },

    _applyElement: function(element, oldElement) {
      if (oldElement) {
        oldElement.removeListener("appear", this.__elementVisibilityHandler);
        oldElement.removeListener("disappear", this.__elementVisibilityHandler);
        this.__removeListeners(["move", "resize"]);
        this.__removeListeners(["scrollX", "scrollY"], true);
      }
      if (element) {
        const isElementVisible = qx.ui.core.queue.Visibility.isVisible(element);
        if (isElementVisible && this.isActive()) {
          this.show();
          this.__updatePosition();
        }
        element.addListener("appear", this.__elementVisibilityHandler, this);
        element.addListener("disappear", this.__elementVisibilityHandler, this);
        this.__addListeners(["move", "resize"]);
        this.__addListeners(["scrollX", "scrollY"], true);
      } else {
        this.exclude();
      }
    },

    __addListeners: function(events, skipElement = false) {
      let widget = skipElement ? this.getElement().getLayoutParent() : this.getElement();
      while (widget && widget !== this.__root) {
        events.map(e => widget.addListener(e, this.__elementVisibilityHandler, this));
        widget = widget.getLayoutParent();
      }
    },

    __removeListeners: function(events, skipElement = false) {
      let widget = skipElement ? this.getElement().getLayoutParent() : this.getElement();
      while (widget && widget !== this.__root) {
        events.map(e => widget.removeListener(e, this.__elementVisibilityHandler));
        widget = widget.getLayoutParent();
      }
    },

    __elementVisibilityHandler: function(e) {
      switch (e.getType()) {
        case "appear":
          this.show();
          this.__updatePosition();
          break;
        case "disappear":
          this.exclude();
          break;
        case "move":
        case "resize":
        case "scrollX":
        case "scrollY":
          setTimeout(() => this.__updatePosition(), 50); // Hacky: Execute async and give some time for the relevant properties to be set
          break;
      }
    },

    __attachEventHandlers: function() {
      this.addListener("appear", () => this.__updatePosition(), this);
    }
  }
});
