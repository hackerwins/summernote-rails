sendFile = (file, toSummernote) ->
  data = new FormData
  data.append 'upload[image]', file
  $.ajax
    data: data
    type: 'POST'
    url: '/uploads'
    cache: false
    contentType: false
    processData: false
    success: (data) ->
      img = document.createElement('IMG')
      img.src = data.url
      console.log data
      img.setAttribute('id', "sn-image-#{data.upload_id}")
      toSummernote.summernote 'insertNode', img
      toSummernote[0].oldValue = $('.note-editable.card-block')[0].innerHTML
      # console.log $('.note-editable.card-block')[0].innerHTML
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
          console.log files
          console.log 'Files were uploaded: {#files}'
          sendFile files[0], $(this)
        onMediaDelete: (target, editor, editable) ->
          console.log target
          console.log 'File was deleted : #{target}'
          upload_id = target[0].id.split('-').slice(-1)[0]
          console.log upload_id
          if !!upload_id
            deleteFile upload_id
          target.remove()
        onKeyup: (e) -> 
          console.log @oldValue
          if e.keyCode == 8 || e.keyCode == 46
            newValue = e.target.innerHTML
            dmp = new diff_match_patch()
            diff = dmp.diff_main(@oldValue, newValue)
            myRegexp = /src=\"\/uploads\/upload\/image\/(.+?)\/(.+?)\"/
            if diff.length > 0
              for segments in diff
                if segments[0] == -1
                  console.log segments[1]
                  target_string = "#{segments[1].slice(-1) + segments[1].replace(/.$/,'')}"
                  match = myRegexp.exec target_string
                  # console.log "image id: #{match[1]}"   
                  # console.log "filename : #{match[2]}"  
                  if match && match[1].match(/^\d+$/)
                    # console.log "image id: #{match[1]}" 
                    if confirm("Are you sure?\nYou can't revert if images have been deleted.")
                      deleteFile match[1]
                  return
            @oldValue = newValue