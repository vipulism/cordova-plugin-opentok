# Publisher Object:
#   Properties:
#     id (String) — The ID of the DOM element through which the Publisher stream is displayed
#     stream - The Stream object corresponding to the stream of the publisher
#     session (Session) — The Session to which the Publisher is publishing a stream. If the Publisher is not publishing a stream to a Session, this property is set to null.
#     replaceElementId (String) — The ID of the DOM element that was replaced when the Publisher video stream was inserted.
#   Methods: 
#     destroy():Publisher - not yet implemented
#     getImgData() : String - not yet implemented
#     getStyle() : Object - not yet implemented
#     off( type, listener )
#     on( type, listener )
#     publishAudio(Boolean) : publisher - change publishing state for Audio
#     publishVideo(Boolean) : publisher - change publishing state for Video
#     setStyle( style, value ) : publisher - not yet implemented
#
class TBPublisher
  constructor: (one, two, three) ->
    @sanitizeInputs( one,two, three )
    pdebug "creating publisher", {}
    position = getPosition(@domId)
    name="TBNameHolder"
    publishAudio="true"
    publishVideo="true"
    cameraName = "front"
    zIndex = TBGetZIndex(document.getElementById(@domId))

    if @properties?
      width = @properties.width ? position.width
      height = @properties.height ? position.height
      name = @properties.name ? "TBNameHolder"
      cameraName = @properties.cameraName ? "front"
      if(@properties.publishAudio? and @properties.publishAudio==false)
        publishAudio="false"
      if(@properties.publishVideo? and @properties.publishVideo==false)
        publishVideo="false"
    if (not width?) or width == 0 or (not height?) or height==0
      width = DefaultWidth
      height = DefaultHeight
    replaceWithVideoStream(@domId, PublisherStreamId, {width:width, height:height})
    position = getPosition(@domId)
    @userHandlers = {}
    TBUpdateObjects()
    Cordova.exec(TBSuccess, TBError, OTPlugin, "initPublisher", [name, position.top, position.left, width, height, zIndex, publishAudio, publishVideo, cameraName] )
    Cordova.exec(@eventReceived, TBSuccess, OTPlugin, "addEvent", ["publisherEvents"] )
  setSession: (session) =>
    @session = session
  eventReceived: (response) =>
    pdebug "publisher event received", response
    @[response.eventType](response.data)
  streamCreated: (event) =>
    pdebug "publisher streamCreatedHandler", event
    pdebug "publisher streamCreatedHandler", @session
    pdebug "publisher streamCreatedHandler", @session.sessionConnection
    @stream = new TBStream( event.stream, @session.sessionConnection )
    streamEvent = new TBEvent( {stream: @stream } )
    pdebug "publisher userHandlers", @userHandlers
    pdebug "publisher userHandlers", @userHandlers['streamCreated']
    if @userHandlers["streamCreated"]
      for e in @userHandlers["streamCreated"]
        e( streamEvent )
    pdebug "omg done", streamEvent
    return @
  streamDestroyed: (event) =>
    pdebug "publisher streamDestroyed event", event
    streamEvent = new TBEvent( {stream: @stream, reason: "clientDisconnected" } )
    if @userHandlers["streamDestroyed"]
      for e in @userHandlers["streamDestroyed"]
        e( streamEvent )
    # remove stream DOM?
    return @

  destroy: ->
    Cordova.exec(TBSuccess, TBError, OTPlugin, "destroyPublisher", [] )
  getImgData: ->
    return ""
  getStyle: ->
    return {}
  off: ( event, handler ) ->
    pdebug "removing event #{event}", @userHandlers
    if @userHandlers[event]?
      @userHandlers[event] = @userHandlers[event].filter ( item, index ) ->
        return item != handler
    pdebug "removed handlers, resulting handlers:", @userHandlers
    #todo
    return @
  on: (one, two, three) =>
    # Set Handlers based on Events
    pdebug "adding event handlers", @userHandlers
    if typeof( one ) == "object"
      for k,v of one
        @addEventHandlers( k, v )
      return
    if typeof( one ) == "string"
      for e in one.split( ' ' )
        @addEventHandlers( e, two )
      return
  publishAudio: (state) ->
    @publishMedia( "publishAudio", state )
    return @
  publishVideo: (state) ->
    @publishMedia( "publishVideo", state )
    return @
  setCameraPosition: (cameraPosition) ->
    pdebug("setting camera position", cameraPosition: cameraPosition)
    Cordova.exec(TBSuccess, TBError, OTPlugin, "setCameraPosition", [cameraPosition])
    return @
  setStyle: (style, value ) ->
    return @

  addEventHandlers: (event, handler) =>
    pdebug "adding Event", event
    if @userHandlers[event]?
      @userHandlers[event].push( handler )
    else
      @userHandlers[event] = [handler]
  publishMedia: (media, state) ->
    if media not in ["publishAudio", "publishVideo"] then return
    publishState = "true"
    if state? and ( state == false or state == "false" )
      publishState = "false"
    pdebug "setting publishstate", {media: media, publishState: publishState}
    Cordova.exec(TBSuccess, TBError, OTPlugin, media, [publishState] )
  sanitizeInputs: (one, two, three) ->
    if( three? )
      # all 3 required properties present: apiKey, domId, properties
      # Check if dom exists
      @apiKey = one
      @domId = two
      @properties = three
    else if( two? )
      # only 2 properties are present, possible inputs: apiKey, domId || apiKey, properties || domId, properties
      if( typeof(two) == "object" )
        # second input is property, so first input is either apiKey or domId
        @properties = two
        if document.getElementById(one)
          @domId = one
        else
          @apiKey = one
      else
        # no property object is passed in
        @apiKey = one
        @domId = two
    else if( one? )
      # only 1 property is present, apiKey || domId || properties
      if( typeof(one) == "object" )
        @properties = one
      else if document.getElementById(one)
        @domId = one
    @apiKey = if @apiKey? then @apiKey else ""
    @properties = if( @properties and typeof( @properties == "object" )) then @properties else {}
    # if domId exists but properties width or height is not specified, set properties
    if( @domId and document.getElementById( @domId ) )
      if !@properties.width or !@properties.height
        console.log "domId exists but properties width or height is not specified"
        position = getPosition( @domId )
        console.log " width: #{position.width} and height: #{position.height} for domId #{@domId}, and top: #{position.top}, left: #{position.left}"
        if position.width > 0 and position.height > 0
          @properties.width = position.width
          @properties.height = position.height
    else
      @domId = TBGenerateDomHelper()
    @domId = if( @domId and document.getElementById( @domId ) ) then @domId else TBGenerateDomHelper()

  # deprecating
  removeEventListener: ( event, handler ) ->
    @off( event, handler )
    return @



