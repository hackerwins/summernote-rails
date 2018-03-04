Array::diff = (a) ->
  @filter (i) ->
    a.indexOf(i) < 0    

makeAjaxCall = (url, methodType, data, target, callback) ->
  $.ajax
    data: data
    type: methodType
    url: url
    cache: false
    contentType: false
    processData: false
    success: (data) ->
      img = document.createElement('IMG')
      img.src = data.url
      img.setAttribute('id', "sn-image-#{data.upload_id}")
      target.summernote 'insertNode', img
      target.oldValue = $('.note-editable.card-block')[0].innerHTML

sendFile = (file, target) ->
  data = new FormData
  data.append 'upload[image]', file
  makeAjaxCall('/uploads', 'POST', data, target).then ((respJson) ->
    target[0].oldValue = $('.note-editable.card-block')[0].innerHTML   
    console.log "success! => #{respJson.upload_id} : #{respJson.url}"
    return
  ), (reason) ->
    console.log 'failure!', reason
    return

deleteFile = (file_id) ->
  $.ajax
    type: 'DELETE'
    url: "/uploads/#{file_id}"
    cache: false
    contentType: false
    processData: false

$(document).on 'turbolinks:load', ->
  $('[data-provider="summernote"]').each ->
    $(this).summernote
      lang: 'ko-KR'
      height: 400
      callbacks:
        onInit: ->
          console.log('Summernote is launched');
          @oldValue = this.value
        onImageUpload: (files, e) ->
          # console.log "Files were uploaded: "
          # console.log files
          for file in files
            sendFile file, $(this)
          console.log "=> Files uploaded..."
          @oldValue = $('.note-editable.card-block')[0].innerHTML
          console.log @oldValue            
        onMediaDelete: (target, editor, editable) ->
          console.log target
          console.log "File was deleted : #{target}"
          upload_id = target[0].id.split('-').slice(-1)[0]
          console.log upload_id
          if !!upload_id
            deleteFile upload_id
            @oldValue = $('.note-editable.card-block')[0].innerHTML
          target.remove()
        onKeyup: (e) -> 
          if e.keyCode == 8 || e.keyCode == 46
            newValue = e.target.innerHTML
            oldImages = @oldValue.match(/<img\s(?:.+?)>/g)
            oldImages = if oldImages then oldImages else []
            newImages = newValue.match(/<img\s(?:.+?)>/g)
            newImages = if newImages then newImages else []
            @oldValue = newValue
            deletedImages = if newImages then oldImages.diff(newImages) else [] 
            if deletedImages.length > 0
              for deletedImage in deletedImages  
                myRegexp = /\/uploads\/upload\/image\/(.+?)\/(.+?)\"/g
                matches = myRegexp.exec deletedImage
                if confirm("Are you sure?\nYou can't revert if images have been deleted.")
                  deleteFile matches[1]
                  console.log "* Permanently removed : #{matches[1]}: #{matches[2]}"