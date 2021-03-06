window.OT = {
  checkSystemRequirements: function() {
    return 1;
  },
  initPublisher: function(one, two, three) {
    return new TBPublisher(one, two, three);
  },
  initSession: function(apiKey, sessionId) {
    if (sessionId == null) {
      this.showError("OT.initSession takes 2 parameters, your API Key and Session ID");
    }
    return new TBSession(apiKey, sessionId);
  },
  log: function(message) {
    return pdebug("TB LOG", message);
  },
  off: function(event, handler) {},
  on: function(event, handler) {
    if (event === "exception") {
      console.log("JS: TB Exception Handler added");
      return Cordova.exec(handler, TBError, OTPlugin, "exceptionHandler", []);
    }
  },
  setLogLevel: function(a) {
    return console.log("Log Level Set");
  },
  upgradeSystemRequirements: function() {
    return {};
  },
  updateViews: function() {
    return TBUpdateObjects();
  },
  showError: function(a) {
    return alert(a);
  },
  addEventListener: function(event, handler) {
    return this.on(event, handler);
  },
  removeEventListener: function(type, handler) {
    return this.off(type, handler);
  }
};

window.TB = OT;

var TBConnection;

TBConnection = (function() {
  function TBConnection(prop) {
    this.connectionId = prop.connectionId;
    this.creationTime = prop.creationTime;
    this.data = prop.data;
    return;
  }

  TBConnection.prototype.toJSON = function() {
    return {
      connectionId: this.connectionId,
      creationTime: this.creationTime,
      data: this.data
    };
  };

  return TBConnection;

})();

var TBEvent,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

TBEvent = (function() {
  function TBEvent(prop) {
    this.preventDefault = __bind(this.preventDefault, this);
    this.isDefaultPrevented = __bind(this.isDefaultPrevented, this);
    var k, v;
    for (k in prop) {
      v = prop[k];
      this[k] = v;
    }
    this.defaultPrevented = false;
    return;
  }

  TBEvent.prototype.isDefaultPrevented = function() {
    return this.defaultValue;
  };

  TBEvent.prototype.preventDefault = function() {};

  return TBEvent;

})();

var TBError, TBGenerateDomHelper, TBGetZIndex, TBSuccess, TBUpdateObjects, getPosition, pdebug, replaceWithVideoStream, streamElements;

streamElements = {};

getPosition = function(divName) {
  var curleft, curtop, height, pubDiv, width;
  pubDiv = document.getElementById(divName);
  if (!pubDiv) {
    return {};
  }
  width = pubDiv.offsetWidth;
  height = pubDiv.offsetHeight;
  curtop = pubDiv.offsetTop;
  curleft = pubDiv.offsetLeft;
  while ((pubDiv = pubDiv.offsetParent)) {
    curleft += pubDiv.offsetLeft;
    curtop += pubDiv.offsetTop;
  }
  return {
    top: curtop,
    left: curleft,
    width: width,
    height: height
  };
};

replaceWithVideoStream = function(divName, streamId, properties) {
  var element, internalDiv, typeClass, videoElement;
  typeClass = streamId === PublisherStreamId ? PublisherTypeClass : SubscriberTypeClass;
  element = document.getElementById(divName);
  element.setAttribute("class", "OT_root " + typeClass);
  element.setAttribute("data-streamid", streamId);
  element.style.width = properties.width + "px";
  element.style.height = properties.height + "px";
  element.style.overflow = "hidden";
  element.style['background-color'] = "#000000";
  streamElements[streamId] = element;
  internalDiv = document.createElement("div");
  internalDiv.setAttribute("class", VideoContainerClass);
  internalDiv.style.width = "100%";
  internalDiv.style.height = "100%";
  internalDiv.style.left = "0px";
  internalDiv.style.top = "0px";
  videoElement = document.createElement("video");
  videoElement.style.width = "100%";
  videoElement.style.height = "100%";
  internalDiv.appendChild(videoElement);
  element.appendChild(internalDiv);
  return element;
};

TBError = function(error) {
  return navigator.notification.alert(error);
};

TBSuccess = function() {
  return console.log("success");
};

TBUpdateObjects = function() {
  var e, id, objects, position, streamId, _i, _len;
  console.log("JS: Objects being updated in TBUpdateObjects");
  objects = document.getElementsByClassName('OT_root');
  for (_i = 0, _len = objects.length; _i < _len; _i++) {
    e = objects[_i];
    console.log("JS: Object updated");
    streamId = e.dataset.streamid;
    console.log("JS sessionId: " + streamId);
    id = e.id;
    position = getPosition(id);
    Cordova.exec(TBSuccess, TBError, OTPlugin, "updateView", [streamId, position.top, position.left, position.width, position.height, TBGetZIndex(e)]);
  }
};

TBGenerateDomHelper = function() {
  var div, domId;
  domId = "PubSub" + Date.now();
  div = document.createElement('div');
  div.setAttribute('id', domId);
  document.body.appendChild(div);
  return domId;
};

TBGetZIndex = function(ele) {
  var val;
  while ((ele != null)) {
    val = document.defaultView.getComputedStyle(ele, null).getPropertyValue('z-index');
    console.log(val);
    if (parseInt(val)) {
      return val;
    }
    ele = ele.offsetParent;
  }
  return 0;
};

pdebug = function(msg, data) {
  return console.log("JS Lib: " + msg + " - ", data);
};

var TBPublisher,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

TBPublisher = (function() {
  function TBPublisher(one, two, three) {
    this.addEventHandlers = __bind(this.addEventHandlers, this);
    this.on = __bind(this.on, this);
    this.streamDestroyed = __bind(this.streamDestroyed, this);
    this.streamCreated = __bind(this.streamCreated, this);
    this.eventReceived = __bind(this.eventReceived, this);
    this.setSession = __bind(this.setSession, this);
    var cameraName, height, name, position, publishAudio, publishVideo, width, zIndex, _ref, _ref1, _ref2, _ref3;
    this.sanitizeInputs(one, two, three);
    pdebug("creating publisher", {});
    position = getPosition(this.domId);
    name = "TBNameHolder";
    publishAudio = "true";
    publishVideo = "true";
    cameraName = "front";
    zIndex = TBGetZIndex(document.getElementById(this.domId));
    if (this.properties != null) {
      width = (_ref = this.properties.width) != null ? _ref : position.width;
      height = (_ref1 = this.properties.height) != null ? _ref1 : position.height;
      name = (_ref2 = this.properties.name) != null ? _ref2 : "TBNameHolder";
      cameraName = (_ref3 = this.properties.cameraName) != null ? _ref3 : "front";
      if ((this.properties.publishAudio != null) && this.properties.publishAudio === false) {
        publishAudio = "false";
      }
      if ((this.properties.publishVideo != null) && this.properties.publishVideo === false) {
        publishVideo = "false";
      }
    }
    if ((width == null) || width === 0 || (height == null) || height === 0) {
      width = DefaultWidth;
      height = DefaultHeight;
    }
    replaceWithVideoStream(this.domId, PublisherStreamId, {
      width: width,
      height: height
    });
    position = getPosition(this.domId);
    this.userHandlers = {};
    TBUpdateObjects();
    Cordova.exec(TBSuccess, TBError, OTPlugin, "initPublisher", [name, position.top, position.left, width, height, zIndex, publishAudio, publishVideo, cameraName]);
    Cordova.exec(this.eventReceived, TBSuccess, OTPlugin, "addEvent", ["publisherEvents"]);
  }

  TBPublisher.prototype.setSession = function(session) {
    return this.session = session;
  };

  TBPublisher.prototype.eventReceived = function(response) {
    pdebug("publisher event received", response);
    return this[response.eventType](response.data);
  };

  TBPublisher.prototype.streamCreated = function(event) {
    var e, streamEvent, _i, _len, _ref;
    pdebug("publisher streamCreatedHandler", event);
    pdebug("publisher streamCreatedHandler", this.session);
    pdebug("publisher streamCreatedHandler", this.session.sessionConnection);
    this.stream = new TBStream(event.stream, this.session.sessionConnection);
    streamEvent = new TBEvent({
      stream: this.stream
    });
    pdebug("publisher userHandlers", this.userHandlers);
    pdebug("publisher userHandlers", this.userHandlers['streamCreated']);
    if (this.userHandlers["streamCreated"]) {
      _ref = this.userHandlers["streamCreated"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e(streamEvent);
      }
    }
    pdebug("omg done", streamEvent);
    return this;
  };

  TBPublisher.prototype.streamDestroyed = function(event) {
    var e, streamEvent, _i, _len, _ref;
    pdebug("publisher streamDestroyed event", event);
    streamEvent = new TBEvent({
      stream: this.stream,
      reason: "clientDisconnected"
    });
    if (this.userHandlers["streamDestroyed"]) {
      _ref = this.userHandlers["streamDestroyed"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e(streamEvent);
      }
    }
    return this;
  };

  TBPublisher.prototype.destroy = function() {
    return Cordova.exec(TBSuccess, TBError, OTPlugin, "destroyPublisher", []);
  };

  TBPublisher.prototype.getImgData = function() {
    return "";
  };

  TBPublisher.prototype.getStyle = function() {
    return {};
  };

  TBPublisher.prototype.off = function(event, handler) {
    pdebug("removing event " + event, this.userHandlers);
    if (this.userHandlers[event] != null) {
      this.userHandlers[event] = this.userHandlers[event].filter(function(item, index) {
        return item !== handler;
      });
    }
    pdebug("removed handlers, resulting handlers:", this.userHandlers);
    return this;
  };

  TBPublisher.prototype.on = function(one, two, three) {
    var e, k, v, _i, _len, _ref;
    pdebug("adding event handlers", this.userHandlers);
    if (typeof one === "object") {
      for (k in one) {
        v = one[k];
        this.addEventHandlers(k, v);
      }
      return;
    }
    if (typeof one === "string") {
      _ref = one.split(' ');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        this.addEventHandlers(e, two);
      }
    }
  };

  TBPublisher.prototype.publishAudio = function(state) {
    this.publishMedia("publishAudio", state);
    return this;
  };

  TBPublisher.prototype.publishVideo = function(state) {
    this.publishMedia("publishVideo", state);
    return this;
  };

  TBPublisher.prototype.setCameraPosition = function(cameraPosition) {
    pdebug("setting camera position", {
      cameraPosition: cameraPosition
    });
    Cordova.exec(TBSuccess, TBError, OTPlugin, "setCameraPosition", [cameraPosition]);
    return this;
  };

  TBPublisher.prototype.setStyle = function(style, value) {
    return this;
  };

  TBPublisher.prototype.addEventHandlers = function(event, handler) {
    pdebug("adding Event", event);
    if (this.userHandlers[event] != null) {
      return this.userHandlers[event].push(handler);
    } else {
      return this.userHandlers[event] = [handler];
    }
  };

  TBPublisher.prototype.publishMedia = function(media, state) {
    var publishState;
    if (media !== "publishAudio" && media !== "publishVideo") {
      return;
    }
    publishState = "true";
    if ((state != null) && (state === false || state === "false")) {
      publishState = "false";
    }
    pdebug("setting publishstate", {
      media: media,
      publishState: publishState
    });
    return Cordova.exec(TBSuccess, TBError, OTPlugin, media, [publishState]);
  };

  TBPublisher.prototype.sanitizeInputs = function(one, two, three) {
    var position;
    if ((three != null)) {
      this.apiKey = one;
      this.domId = two;
      this.properties = three;
    } else if ((two != null)) {
      if (typeof two === "object") {
        this.properties = two;
        if (document.getElementById(one)) {
          this.domId = one;
        } else {
          this.apiKey = one;
        }
      } else {
        this.apiKey = one;
        this.domId = two;
      }
    } else if ((one != null)) {
      if (typeof one === "object") {
        this.properties = one;
      } else if (document.getElementById(one)) {
        this.domId = one;
      }
    }
    this.apiKey = this.apiKey != null ? this.apiKey : "";
    this.properties = this.properties && typeof (this.properties === "object") ? this.properties : {};
    if (this.domId && document.getElementById(this.domId)) {
      if (!this.properties.width || !this.properties.height) {
        console.log("domId exists but properties width or height is not specified");
        position = getPosition(this.domId);
        console.log(" width: " + position.width + " and height: " + position.height + " for domId " + this.domId + ", and top: " + position.top + ", left: " + position.left);
        if (position.width > 0 && position.height > 0) {
          this.properties.width = position.width;
          this.properties.height = position.height;
        }
      }
    } else {
      this.domId = TBGenerateDomHelper();
    }
    return this.domId = this.domId && document.getElementById(this.domId) ? this.domId : TBGenerateDomHelper();
  };

  TBPublisher.prototype.removeEventListener = function(event, handler) {
    this.off(event, handler);
    return this;
  };

  return TBPublisher;

})();

var TBSession,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

TBSession = (function() {
  TBSession.prototype.connect = function(token, connectCompletionCallback) {
    this.token = token;
    if (typeof connectCompletionCallback !== "function" && (connectCompletionCallback != null)) {
      TB.showError("Session.connect() takes a token and an optional completionHandler");
      return;
    }
    if ((connectCompletionCallback != null)) {
      this.addEventHandlers("sessionConnected", connectCompletionCallback);
    }
    Cordova.exec(this.eventReceived, TBError, OTPlugin, "addEvent", ["sessionEvents"]);
    Cordova.exec(TBSuccess, TBError, OTPlugin, "connect", [this.token]);
  };

  TBSession.prototype.disconnect = function() {
    return Cordova.exec(TBSuccess, TBError, OTPlugin, "disconnect", []);
  };

  TBSession.prototype.forceDisconnect = function(connection) {
    return this;
  };

  TBSession.prototype.forceUnpublish = function(stream) {
    return this;
  };

  TBSession.prototype.getPublisherForStream = function(stream) {
    return this;
  };

  TBSession.prototype.getSubscribersForStream = function(stream) {
    return this;
  };

  TBSession.prototype.off = function(one, two, three) {
    var e, k, v, _i, _len, _ref, _results;
    if (typeof one === "object") {
      for (k in one) {
        v = one[k];
        this.removeEventHandler(k, v);
      }
      return;
    }
    if (typeof one === "string") {
      _ref = one.split(' ');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        _results.push(this.removeEventHandler(e, two));
      }
      return _results;
    }
  };

  TBSession.prototype.on = function(one, two, three) {
    var e, k, v, _i, _len, _ref;
    pdebug("adding event handlers", this.userHandlers);
    if (typeof one === "object") {
      for (k in one) {
        v = one[k];
        this.addEventHandlers(k, v);
      }
      return;
    }
    if (typeof one === "string") {
      _ref = one.split(' ');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        this.addEventHandlers(e, two);
      }
    }
  };

  TBSession.prototype.publish = function(divName, properties) {
    if (this.alreadyPublishing) {
      pdebug("Session is already publishing", {});
      return;
    }
    this.alreadyPublishing = true;
    this.publisher = new TBPublisher(divName, properties);
    return this.publish(this.publisher);
  };

  TBSession.prototype.publish = function(publisher) {
    if (this.alreadyPublishing) {
      pdebug("Session is already publishing", {});
      return;
    }
    this.alreadyPublishing = true;
    this.publisher = publisher;
    publisher.setSession(this);
    Cordova.exec(TBSuccess, TBError, OTPlugin, "publish", []);
    return this.publisher;
  };

  TBSession.prototype.signal = function(signal, signalCompletionHandler) {
    var connectionArray, connectionIdArray, data, e, type, _i, _len;
    type = signal.type != null ? signal.type : "";
    data = signal.data != null ? signal.data : "";
    connectionArray = signal.connections != null ? signal.connections : [];
    connectionIdArray = [];
    for (_i = 0, _len = connectionArray.length; _i < _len; _i++) {
      e = connectionArray[_i];
      if (typeof e === "object" && (e.connectionId != null)) {
        connectionIdArray.push(e.connectionId);
      }
      if (typeof e === "string") {
        connectionIdArray.push(e.split(' ')[0]);
      }
    }
    Cordova.exec(TBSuccess, TBError, OTPlugin, "signal", [type, data, connectionIdArray.join(' ')]);
    return this;
  };

  TBSession.prototype.subscribe = function(one, two, three) {
    var domId, subscriber;
    if ((three != null)) {
      subscriber = new TBSubscriber(one, two, three);
      return subscriber;
    }
    if ((two != null)) {
      if (typeof two === "object") {
        domId = TBGenerateDomHelper();
        subscriber = new TBSubscriber(one, domId, two);
        return subscriber;
      } else {
        subscriber = new TBSubscriber(one, two, {});
        return subscriber;
      }
    }
    domId = TBGenerateDomHelper();
    subscriber = new TBSubscriber(one, domId, {});
    return subscriber;
  };

  TBSession.prototype.unpublish = function() {
    var element;
    this.alreadyPublishing = false;
    console.log("JS: Unpublish");
    element = document.getElementById(this.publisher.domId);
    if (element) {
      element.parentNode.removeChild(element);
      TBUpdateObjects();
    }
    return Cordova.exec(TBSuccess, TBError, OTPlugin, "unpublish", []);
  };

  TBSession.prototype.unsubscribe = function(subscriber) {
    var element, elementId;
    console.log("JS: Unsubscribe");
    elementId = subscriber.streamId;
    element = document.getElementById("TBStreamConnection" + elementId);
    console.log("JS: Unsubscribing");
    element = streamElements[elementId];
    if (element) {
      element.parentNode.removeChild(element);
      delete streamElements[streamId];
      TBUpdateObjects();
    }
    return Cordova.exec(TBSuccess, TBError, OTPlugin, "unsubscribe", [subscriber.streamId]);
  };

  function TBSession(apiKey, sessionId) {
    this.apiKey = apiKey;
    this.sessionId = sessionId;
    this.signalReceived = __bind(this.signalReceived, this);
    this.streamDestroyed = __bind(this.streamDestroyed, this);
    this.streamCreated = __bind(this.streamCreated, this);
    this.sessionDisconnected = __bind(this.sessionDisconnected, this);
    this.sessionConnected = __bind(this.sessionConnected, this);
    this.connectionDestroyed = __bind(this.connectionDestroyed, this);
    this.connectionCreated = __bind(this.connectionCreated, this);
    this.eventReceived = __bind(this.eventReceived, this);
    this.removeEventHandler = __bind(this.removeEventHandler, this);
    this.addEventHandlers = __bind(this.addEventHandlers, this);
    this.publish = __bind(this.publish, this);
    this.publish = __bind(this.publish, this);
    this.on = __bind(this.on, this);
    this.userHandlers = {};
    this.connections = {};
    this.streams = {};
    this.alreadyPublishing = false;
    Cordova.exec(TBSuccess, TBSuccess, OTPlugin, "initSession", [this.apiKey, this.sessionId]);
  }

  TBSession.prototype.cleanUpDom = function() {
    var e, objects, _results;
    objects = document.getElementsByClassName('OT_root');
    _results = [];
    while (objects.length > 0) {
      e = objects[0];
      if (e && e.parentNode && e.parentNode.removeChild) {
        e.parentNode.removeChild(e);
      }
      _results.push(objects = document.getElementsByClassName('OT_root'));
    }
    return _results;
  };

  TBSession.prototype.addEventHandlers = function(event, handler) {
    pdebug("adding Event", event);
    if (this.userHandlers[event] != null) {
      return this.userHandlers[event].push(handler);
    } else {
      return this.userHandlers[event] = [handler];
    }
  };

  TBSession.prototype.removeEventHandler = function(event, handler) {
    pdebug("removing event " + event, this.userHandlers);
    if (handler == null) {
      delete this.userHandlers[event];
    } else {
      if (this.userHandlers[event] != null) {
        this.userHandlers[event] = this.userHandlers[event].filter(function(item, index) {
          return item !== handler;
        });
      }
    }
    return this;
  };

  TBSession.prototype.eventReceived = function(response) {
    pdebug("session event received", response);
    return this[response.eventType](response.data);
  };

  TBSession.prototype.connectionCreated = function(event) {
    var connection, connectionEvent, e, _i, _len, _ref;
    connection = new TBConnection(event.connection);
    connectionEvent = new TBEvent({
      connection: connection
    });
    this.connections[connection.connectionId] = connection;
    if (this.userHandlers["connectionCreated"]) {
      _ref = this.userHandlers["connectionCreated"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e(connectionEvent);
      }
    }
    return this;
  };

  TBSession.prototype.connectionDestroyed = function(event) {
    var connection, connectionEvent, e, _i, _len, _ref;
    pdebug("connectionDestroyedHandler", event);
    connection = this.connections[event.connection.connectionId];
    connectionEvent = new TBEvent({
      connection: connection,
      reason: "clientDisconnected"
    });
    if (this.userHandlers["connectionDestroyed"]) {
      _ref = this.userHandlers["connectionDestroyed"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e(connectionEvent);
      }
    }
    delete this.connections[connection.connectionId];
    return this;
  };

  TBSession.prototype.sessionConnected = function(event) {
    var e, _i, _len, _ref;
    pdebug("sessionConnectedHandler", event);
    pdebug("what is userHandlers", this.userHandlers);
    this.sessionConnection = event.connection;
    event = null;
    if (this.userHandlers["sessionConnected"]) {
      _ref = this.userHandlers["sessionConnected"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e(event);
      }
    }
    return this;
  };

  TBSession.prototype.sessionDisconnected = function(event) {
    var e, sessionDisconnectedEvent, _i, _len, _ref;
    pdebug("sessionDisconnected event", event);
    this.alreadyPublishing = false;
    sessionDisconnectedEvent = new TBEvent({
      reason: event.reason
    });
    if (this.userHandlers["sessionDisconnected"]) {
      _ref = this.userHandlers["sessionDisconnected"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e(sessionDisconnectedEvent);
      }
    }
    this.cleanUpDom();
    return this;
  };

  TBSession.prototype.streamCreated = function(event) {
    var e, stream, streamEvent, _i, _len, _ref;
    pdebug("streamCreatedHandler", event);
    stream = new TBStream(event.stream, this.connections[event.stream.connectionId]);
    this.streams[stream.streamId] = stream;
    streamEvent = new TBEvent({
      stream: stream
    });
    if (this.userHandlers["streamCreated"]) {
      _ref = this.userHandlers["streamCreated"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e(streamEvent);
      }
    }
    return this;
  };

  TBSession.prototype.streamDestroyed = function(event) {
    var e, element, stream, streamEvent, _i, _len, _ref;
    pdebug("streamDestroyed event", event);
    stream = this.streams[event.stream.streamId];
    streamEvent = new TBEvent({
      stream: stream,
      reason: "clientDisconnected"
    });
    if (this.userHandlers["streamDestroyed"]) {
      _ref = this.userHandlers["streamDestroyed"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e(streamEvent);
      }
    }
    element = streamElements[stream.streamId];
    if (element) {
      element.parentNode.removeChild(element);
      delete streamElements[stream.streamId];
      TBUpdateObjects();
    }
    delete this.streams[stream.streamId];
    return this;
  };

  TBSession.prototype.signalReceived = function(event) {
    var e, streamEvent, _i, _j, _len, _len1, _ref, _ref1, _results;
    pdebug("signalReceived event", event);
    streamEvent = new TBEvent({
      type: event.type,
      data: event.data,
      from: this.connections[event.connectionId]
    });
    if (this.userHandlers["signal"]) {
      _ref = this.userHandlers["signal"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e(streamEvent);
      }
    }
    if ((event.type != null) && event.type.length > 0 && this.userHandlers["signal:" + event.type]) {
      _ref1 = this.userHandlers["signal:" + event.type];
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        e = _ref1[_j];
        _results.push(e(streamEvent));
      }
      return _results;
    }
  };

  TBSession.prototype.addEventListener = function(event, handler) {
    this.on(event, handler);
    return this;
  };

  TBSession.prototype.removeEventListener = function(event, handler) {
    this.off(event, handler);
    return this;
  };

  return TBSession;

})();

var TBStream;

TBStream = (function() {
  function TBStream(prop, connection) {
    var k, v;
    this.connection = connection;
    for (k in prop) {
      v = prop[k];
      this[k] = v;
    }
    this.videoDimensions = {
      width: 0,
      height: 0
    };
  }

  return TBStream;

})();

var TBSubscriber;

TBSubscriber = (function() {
  TBSubscriber.prototype.getAudioVolume = function() {
    return 0;
  };

  TBSubscriber.prototype.getImgData = function() {
    return "";
  };

  TBSubscriber.prototype.getStyle = function() {
    return {};
  };

  TBSubscriber.prototype.off = function(event, handler) {
    return this;
  };

  TBSubscriber.prototype.on = function(event, handler) {
    return this;
  };

  TBSubscriber.prototype.setAudioVolume = function(value) {
    return this;
  };

  TBSubscriber.prototype.setStyle = function(style, value) {
    return this;
  };

  TBSubscriber.prototype.subscribeToAudio = function(value) {
    return this;
  };

  TBSubscriber.prototype.subscribeToVideo = function(value) {
    return this;
  };

  function TBSubscriber(stream, divName, properties) {
    var divPosition, height, name, obj, position, subscribeToAudio, subscribeToVideo, width, zIndex, _ref, _ref1, _ref2;
    pdebug("creating subscriber", properties);
    this.streamId = stream.streamId;
    console.log("creating a subscriber, replacing div " + divName);
    divPosition = getPosition(divName);
    subscribeToVideo = "true";
    zIndex = TBGetZIndex(document.getElementById(divName));
    if ((properties != null)) {
      width = (_ref = properties.width) != null ? _ref : divPosition.width;
      height = (_ref1 = properties.height) != null ? _ref1 : divPosition.height;
      name = (_ref2 = properties.name) != null ? _ref2 : "";
      subscribeToVideo = "true";
      subscribeToAudio = "true";
      if ((properties.subscribeToVideo != null) && properties.subscribeToVideo === false) {
        subscribeToVideo = "false";
      }
      if ((properties.subscribeToAudio != null) && properties.subscribeToAudio === false) {
        subscribeToAudio = "false";
      }
    }
    if ((width == null) || width === 0 || (height == null) || height === 0) {
      width = DefaultWidth;
      height = DefaultHeight;
    }
    console.log("setting width to " + width + ", and height to " + height);
    obj = replaceWithVideoStream(divName, stream.streamId, {
      width: width,
      height: height
    });
    position = getPosition(obj.id);
    Cordova.exec(TBSuccess, TBError, OTPlugin, "subscribe", [stream.streamId, position.top, position.left, width, height, zIndex, subscribeToAudio, subscribeToVideo]);
  }

  TBSubscriber.prototype.removeEventListener = function(event, listener) {
    return this;
  };

  return TBSubscriber;

})();

var DefaultHeight, DefaultWidth, OTPlugin, PublisherStreamId, PublisherTypeClass, StringSplitter, SubscriberTypeClass, VideoContainerClass;

OTPlugin = "OpenTokPlugin";

PublisherStreamId = "TBPublisher";

PublisherTypeClass = "OT_publisher";

SubscriberTypeClass = "OT_subscriber";

VideoContainerClass = "OT_video-container";

StringSplitter = "$2#9$";

DefaultWidth = 264;

DefaultHeight = 198;
