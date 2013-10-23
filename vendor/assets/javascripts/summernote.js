/**
 * summernote.js
 * (c) 2013~ Alan Hong
 * summernote may be freely distributed under the MIT license./
 */
(function($) { "use strict";
  //Check Platform/Agent
  var bMac = navigator.appVersion.indexOf('Mac') > -1; 
  var bMSIE = navigator.userAgent.indexOf('MSIE') > -1;
  
  /**
   * func utils (for high-order func's arg)
   */
  var func = function() {
    var eq = function(elA) { return function(elB) { return elA === elB; }; };
    var eq2 = function(elA, elB) { return elA === elB; };
    var fail = function() { return false; };
    var not = function(f) { return function() { return !f.apply(f, arguments); }};
    var self = function(a) { return a; }
    return { eq: eq, eq2: eq2, fail: fail, not: not, self: self };
  }();
  
  /**
   * list utils
   */
  var list = function() {
    var head = function(array) { return array[0]; };
    var last = function(array) { return array[array.length - 1]; };
    var initial = function(array) { return array.slice(0, array.length - 1); };
    var tail = function(array) { return array.slice(1); };

    var sum = function(array, fn) {
      fn = fn || func.self;
      return array.reduce(function(memo, v) {
        return memo + fn(v);
      }, 0);
    };

    var from = function(collection) {
      var result = [], idx = -1, length = collection.length;
      while (++idx < length) {
        result[idx] = collection[idx];
      }
      return result;
    };
    
    var clusterBy = function(array, fn) {
      if (array.length === 0) { return []; }
      var aTail = tail(array);
      return aTail.reduce(function (memo, v) {
        var aLast = last(memo);
        if (fn(last(aLast), v)) {
          aLast[aLast.length] = v;
        } else {
          memo[memo.length] = [v];
        }
        return memo;
      }, [[head(array)]]);
    };

    var compact = function(array) {
      var aResult = [];
      for (var idx = 0, sz = array.length; idx < sz; idx ++) {
        if (array[idx]) { aResult.push(array[idx]); };
      };
      return aResult;
    };

    return { head: head, last: last, initial: initial, tail: tail, 
             sum: sum, from: from, compact: compact, clusterBy: clusterBy };
  }();
  
  /**
   * dom utils
   */
  var dom = function() {
    var makePredByNodeName = function(sNodeName) {
      // nodeName of element is always uppercase.
      return function(node) { return node && node.nodeName === sNodeName; };
    };
    
    var isPara = function(node) {
      return node && /^P|^LI|^H[1-7]/.test(node.nodeName);
    };

    var isList = function(node) {
      return node && /^UL|^OL/.test(node.nodeName);
    };

    var isEditable = function(node) {
      return node && $(node).hasClass('note-editable');
    };

    var isControlSizing = function(node) {
      return node && $(node).hasClass('note-control-sizing');
    };

    // ancestor: find nearest ancestor predicate hit
    var ancestor = function(node, pred) {
      while (node) {
        if (pred(node)) { return node; }
        node = node.parentNode;
      }
      return null;
    };
    
    // listAncestor: listing ancestor nodes (until predicate hit: optional)
    var listAncestor = function(node, pred) {
      pred = pred || func.fail;      
      
      var aAncestor = [];
      ancestor(node, function(el) {
        aAncestor.push(el);
        return pred(el);
      });
      return aAncestor;
    };
    
    // commonAncestor: find commonAncestor
    var commonAncestor = function(nodeA, nodeB) {
      var aAncestor = listAncestor(nodeA);
      for (var n = nodeB; n; n = n.parentNode) {
        if ($.inArray(n, aAncestor) > -1) { return n; }
      }
      return null; // difference document area
    };

    // listBetween: listing all Nodes between nodeA and nodeB
    // FIXME: nodeA and nodeB must be sorted, use comparePoints later.
    var listBetween = function(nodeA, nodeB) {
      var aNode = [];

      var bStart = false, bEnd = false;
      var fnWalk = function(node) {
        if (!node) { return; } // traverse fisnish
        if (node === nodeA) { bStart = true; } // start point
        if (bStart && !bEnd) { aNode.push(node) } // between
        if (node === nodeB) { bEnd = true; return; } // end point

        for (var idx = 0, sz = node.childNodes.length; idx < sz; idx++) {
          fnWalk(node.childNodes[idx]);
        }
      }

      fnWalk(commonAncestor(nodeA, nodeB)); // DFS with commonAcestor.
      return aNode;
    };

    // listPrev: listing prevSiblings (until predicate hit: optional)
    var listPrev = function(node, pred) {
      pred = pred || func.fail;      

      var aNext = [];
      while (node) {
        aNext.push(node);
        if (pred(node)) { break; }
        node = node.previousSibling;
      };
      return aNext;
    };
    
    // listNext: listing nextSiblings (until predicate hit: optional)
    var listNext = function(node, pred) {
      pred = pred || func.fail;      

      var aNext = [];
      while (node) {
        aNext.push(node);
        if (pred(node)) { break; }
        node = node.nextSibling;
      };
      return aNext;
    };
    
    // insertAfter: insert node after preceding
    var insertAfter = function(node, preceding) {
      var next = preceding.nextSibling, parent = preceding.parentNode;
      if (next) {
        parent.insertBefore(node, next);
      } else {
        parent.appendChild(node);
      }
      return node;
    };

    // appends: append children
    var appends = function(node, aChild) {
      $.each(aChild, function(idx, child) {
        node.appendChild(child);
      });
      return node;
    };
    
    var isText = makePredByNodeName('#text');

    // length: size of element.
    var length = function(node) {
      if (isText(node)) { return node.nodeValue.length; }
      return node.childNodes.length;
    };

    // position: offset from parent.
    var position = function(node) {
      var offset = 0;
      while (node = node.previousSibling) { offset += 1; }
      return offset;
    };

    // makeOffsetPath: return offsetPath(offset list) from ancestor
    var makeOffsetPath = function(ancestor, node) {
      var aAncestor = list.initial(listAncestor(node, func.eq(ancestor)));
      return $.map(aAncestor, position).reverse();
    };

    // fromtOffsetPath: return element from offsetPath(offset list)
    var fromOffsetPath = function(ancestor, aOffset) {
      var current = ancestor;
      for (var i = 0, sz = aOffset.length; i < sz; i++) {
        current = current.childNodes[aOffset[i]];
      }
      return current;
    };

    // splitData: split element or #text
    var splitData = function(node, offset) {
      if (offset === 0) { return node; }
      if (offset >= length(node)) { return node.nextSibling; }

      // splitText
      if (isText(node)) { return node.splitText(offset); }

      // splitElement
      var child = node.childNodes[offset];
      node = insertAfter(node.cloneNode(false), node);
      return appends(node, listNext(child));
    };
    
    // split: split dom tree by boundaryPoint(pivot and offset)
    var split = function(root, pivot, offset) {
      var aAncestor = listAncestor(pivot, func.eq(root));
      if (aAncestor.length === 1) { return splitData(pivot, offset); }
      return aAncestor.reduce(function(node, parent) {
        var clone = parent.cloneNode(false);
        insertAfter(clone, parent);
        if (node === pivot) {
          node = splitData(node, offset);
        }
        appends(clone, listNext(node));
        return clone;
      });
    };

    // remove: remove node, (bRemoveChild: remove child or not)
    var remove = function(node, bRemoveChild) {
      if (!node || !node.parentNode) { return; }
      if (node.removeNode) { return node.removeNode(bRemoveChild); }

      var elParent = node.parentNode;
      if (!bRemoveChild) {
        var aNode = [];
        for (var i = 0, sz = node.childNodes.length; i < sz; i++) {
          aNode.push(node.childNodes[i]);
        }

        for (var i = 0, sz = aNode.length; i < sz; i++) {
          elParent.insertBefore(aNode[i], node);
        }
      }

      elParent.removeChild(node);
    };

    var unescape = function(str) {
      return $("<div/>").html(str).text();
    };
    var html = function($node) {
      return dom.isTextarea($node[0]) ? unescape($node.val()) : $node.html();
    };
    
    return {
      isText: isText,
      isPara: isPara, isList: isList,
      isEditable: isEditable, isControlSizing: isControlSizing,
      isAnchor: makePredByNodeName('A'),
      isDiv: makePredByNodeName('DIV'), isSpan: makePredByNodeName('SPAN'),
      isB: makePredByNodeName('B'), isU: makePredByNodeName('U'),
      isS: makePredByNodeName('S'), isI: makePredByNodeName('I'),
      isImg: makePredByNodeName('IMG'), isTextarea: makePredByNodeName('TEXTAREA'),
      ancestor: ancestor, listAncestor: listAncestor,
      listNext: listNext, listPrev: listPrev,
      commonAncestor: commonAncestor, listBetween: listBetween,
      insertAfter: insertAfter, position: position,
      makeOffsetPath: makeOffsetPath, fromOffsetPath: fromOffsetPath,
      split: split, remove: remove, html: html
    };
  }();

  /**
   * range module
   */
  var range = function() {
    var bW3CRangeSupport = !!document.createRange;

    // return boundaryPoint from TextRange, inspired by Andy Na's HuskyRange.js
    var textRange2bp = function(textRange, bStart) {
      var elCont = textRange.parentElement(), nOffset;

      var tester = document.body.createTextRange(), elPrevCont;
      var aChild = list.from(elCont.childNodes);
      for (nOffset = 0; nOffset < aChild.length; nOffset++) {
        if (dom.isText(aChild[nOffset])) { continue; }
        tester.moveToElementText(aChild[nOffset]);
        if (tester.compareEndPoints('StartToStart', textRange) >= 0) { break; }
        elPrevCont = aChild[nOffset];
      }

      if (nOffset != 0 && dom.isText(aChild[nOffset - 1])) {
        var textRangeStart = document.body.createTextRange(), elCurText = null;
        textRangeStart.moveToElementText(elPrevCont || elCont);
        textRangeStart.collapse(!elPrevCont);
        elCurText = elPrevCont ? elPrevCont.nextSibling : elCont.firstChild;

        var pointTester = textRange.duplicate();
        pointTester.setEndPoint('StartToStart', textRangeStart);
        var nTextCount = pointTester.text.replace(/[\r\n]/g, '').length;

        while (nTextCount > elCurText.nodeValue.length && elCurText.nextSibling) {
          nTextCount -= elCurText.nodeValue.length;
          elCurText = elCurText.nextSibling;
        }
        var sDummy = elCurText.nodeValue; //enforce IE to re-reference elCurText

        if (bStart && elCurText.nextSibling && dom.isText(elCurText.nextSibling) &&
            nTextCount == elCurText.nodeValue.length) {
          nTextCount -= elCurText.nodeValue.length;
        elCurText = elCurText.nextSibling;
        }

        elCont = elCurText;
        nOffset = nTextCount;
      }

      return {cont: elCont, offset: nOffset};
    };

    // return TextRange from boundary point (inspired by google closure-library)
    var bp2textRange = function(bp) {
      var textRangeInfo = function(elCont, nOffset) {
        var elNode, bCollapseToStart;

        if (dom.isText(elCont)) {
          var aPrevText = dom.listPrev(elCont, func.not(dom.isText));
          var elPrevCont = list.last(aPrevText).previousSibling;
          elNode =  elPrevCont || elCont.parentNode;
          nOffset += list.sum(list.tail(aPrevText), dom.length);
          bCollapseToStart = !elPrevCont;
        } else {
          elNode = elCont.childNodes[nOffset] || elCont;
          if (dom.isText(elNode)) {
            return textRangeInfo(elNode, nOffset);
          }

          nOffset = 0;
          bCollapseToStart = false;
        }

        return {cont: elNode, collapseToStart: bCollapseToStart, offset: nOffset};
      }

      var textRange = document.body.createTextRange();
      var info = textRangeInfo(bp.cont, bp.offset);

      textRange.moveToElementText(info.cont);
      textRange.collapse(info.collapseToStart);
      textRange.moveStart('character', info.offset);
      return textRange;
    };

    // {startContainer, startOffset, endContainer, endOffset}
    var WrappedRange = function(sc, so, ec, eo) {
      this.sc = sc; this.so = so;
      this.ec = ec; this.eo = eo;

      // nativeRange: get nativeRange from sc, so, ec, eo
      var nativeRange = function() {
        if (bW3CRangeSupport) {
          var w3cRange = document.createRange();
          w3cRange.setStart(sc, so);
          w3cRange.setEnd(ec, eo);
          return w3cRange;
        } else {
          var textRange = bp2textRange({cont:sc, offset:so});
          textRange.setEndPoint('EndToEnd', bp2textRange({cont:ec, offset:eo}));
          return textRange;
        }
      };

      // select: update visible range
      this.select = function() {
        var nativeRng = nativeRange();
        if (bW3CRangeSupport) {
          var selection = document.getSelection();
          if (selection.rangeCount > 0) { selection.removeAllRanges(); }
          selection.addRange(nativeRng);
        } else {
          nativeRng.select();
        }
      };

      // listPara: listing paragraphs on range
      this.listPara = function() {
        var aNode = dom.listBetween(sc, ec);
        var aPara = list.compact($.map(aNode, function(node) {
          return dom.ancestor(node, dom.isPara);
        }));
        return $.map(list.clusterBy(aPara, func.eq2), list.head);
      };

      // makeIsOn: return isOn(pred) function
      var makeIsOn = function(pred) {
        return function() {
          var elAncestor = dom.ancestor(sc, pred);
          return elAncestor && (elAncestor === dom.ancestor(ec, pred));
        };
      };

      // isOnEditable: judge whether range is on editable or not
      this.isOnEditable = makeIsOn(dom.isEditable);
      // isOnList: judge whether range is on list node or not
      this.isOnList = makeIsOn(dom.isList);
      // isOnAnchor: judge whether range is on anchor node or not
      this.isOnAnchor = makeIsOn(dom.isAnchor);

      // isCollapsed: judge whether range was collapsed
      this.isCollapsed = function() { return sc === ec && so === eo; };

      // insertNode
      this.insertNode = function(node) {
        var nativeRng = nativeRange();
        if (bW3CRangeSupport) {
          nativeRng.insertNode(node);
        } else {
          nativeRng.pasteHTML(node.outerHTML); // NOTE: missing node reference.
        }
      };

      this.toString = function() {
        var nativeRng = nativeRange();
        if (bW3CRangeSupport) {
          return nativeRng.toString();
        } else {
          return nativeRng.text;
        }
      };

      //bookmark: offsetPath bookmark
      this.bookmark = function(elEditable) {
        return {
          s: { path: dom.makeOffsetPath(elEditable, sc), offset: so },
          e: { path: dom.makeOffsetPath(elEditable, ec), offset: eo }
        };
      };
    };

    return { // Range Object
      // create Range Object From arguments or Browser Selection
      create : function(sc, so, ec, eo) {
        if (arguments.length === 0) { // from Browser Selection
          if (bW3CRangeSupport) { // webkit, firefox
            var nativeRng = document.getSelection().getRangeAt(0);
            sc = nativeRng.startContainer, so = nativeRng.startOffset,
            ec = nativeRng.endContainer, eo = nativeRng.endOffset;
          } else { // IE8: TextRange
            var textRange = document.selection.createRange();
            var textRangeEnd = textRange.duplicate(); textRangeEnd.collapse(false);
            var textRangeStart = textRange; textRangeStart.collapse(true);

            var bpStart = textRange2bp(textRangeStart, true),
            bpEnd = textRange2bp(textRangeEnd, false);

            sc = bpStart.cont, so = bpStart.offset;
            ec = bpEnd.cont, eo = bpEnd.offset;
          }
        } else if (arguments.length === 2) { //collapsed
          ec = sc; eo = so;
        }
        return new WrappedRange(sc, so, ec, eo);
      },
      // createFromBookmark
      createFromBookmark : function(elEditable, bookmark) {
        var sc = dom.fromOffsetPath(elEditable, bookmark.s.path);
        var so = bookmark.s.offset;
        var ec = dom.fromOffsetPath(elEditable, bookmark.e.path);
        var eo = bookmark.e.offset;
        return new WrappedRange(sc, so, ec, eo);
      }
    };
  }();
  
  /**
   * Style
   */
  var Style = function() {
    // para level style
    this.stylePara = function(rng, oStyle) {
      var aPara = rng.listPara();
      $.each(aPara, function(idx, elPara) {
        $.each(oStyle, function(sKey, sValue) {
          elPara.style[sKey] = sValue;
        });
      });
    };
    
    // get current style, elTarget: target element on event.
    this.current = function(rng, elTarget) {
      var welCont = $(dom.isText(rng.sc) ? rng.sc.parentNode : rng.sc);
      var oStyle = welCont.css(['font-size', 'text-align',
                                'list-style-type', 'line-height']) || {};

      oStyle['font-size'] = parseInt(oStyle['font-size']);

      // document.queryCommandState for toggle state
      oStyle['font-bold'] = document.queryCommandState('bold') ? 'bold' : 'normal';
      oStyle['font-italic'] = document.queryCommandState('italic') ? 'italic' : 'normal';
      oStyle['font-underline'] = document.queryCommandState('underline') ? 'underline' : 'normal';
      
      // list-style-type to list-style(unordered, ordered)
      if (!rng.isOnList()) {
        oStyle['list-style'] = 'none';
      } else {
        var aOrderedType = ['circle', 'disc', 'disc-leading-zero', 'square'];
        var bUnordered = $.inArray(oStyle['list-style-type'], aOrderedType) > -1;
        oStyle['list-style'] = bUnordered ? 'unordered' : 'ordered';
      }

      var elPara = dom.ancestor(rng.sc, dom.isPara);
      if (elPara && elPara.style['line-height']) {
        oStyle['line-height'] = elPara.style.lineHeight;
      } else {
        var lineHeight = parseInt(oStyle['line-height']) / parseInt(oStyle['font-size']);
        oStyle['line-height'] = lineHeight.toFixed(1);
      }

      oStyle.image = dom.isImg(elTarget) && elTarget;
      oStyle.anchor = rng.isOnAnchor() && dom.ancestor(rng.sc, dom.isAnchor);
      oStyle.aAncestor = dom.listAncestor(rng.sc, dom.isEditable);

      return oStyle;
    }
  };

  /**
   * History
   */
  var History = function() {
    var aUndo = [], aRedo = [];

    var makeSnap = function(welEditable) {
      var elEditable = welEditable[0], rng = range.create();
      return {
        contents: welEditable.html(), bookmark: rng.bookmark(elEditable),
        scrollTop: welEditable.scrollTop()
      };
    };

    var applySnap = function(welEditable, oSnap) {
      welEditable.html(oSnap.contents).scrollTop(oSnap.scrollTop);
      range.createFromBookmark(welEditable[0], oSnap.bookmark).select();
    };

    this.undo = function(welEditable) {
      var oSnap = makeSnap(welEditable);
      if (aUndo.length === 0) { return; }
      applySnap(welEditable, aUndo.pop()), aRedo.push(oSnap);
    };

    this.redo = function(welEditable) {
      var oSnap = makeSnap(welEditable);
      if (aRedo.length === 0) { return; }
      applySnap(welEditable, aRedo.pop()), aUndo.push(oSnap);
    };

    this.recordUndo = function(welEditable) {
      aRedo = [], aUndo.push(makeSnap(welEditable));
    };
  };
  
  /**
   * Editor
   */
  var Editor = function() {
    //currentStyle
    var style = new Style();
    this.currentStyle = function(elTarget) {
      var rng = range.create();
      return rng.isOnEditable() && style.current(rng, elTarget);
    };

    this.tab = function(welEditable) {
      recordUndo(welEditable);
      var rng = range.create();
      var sNbsp = new Array(welEditable.data('tabsize') + 1).join('&nbsp;')
      rng.insertNode($('<span id="noteTab">' + sNbsp + '</span>')[0]);
      var welTab = $('#noteTab').removeAttr('id');
      rng = range.create(welTab[0], 1);
      rng.select();
      dom.remove(welTab[0]);
    };

    // undo
    this.undo = function(welEditable) {
      welEditable.data('NoteHistory').undo(welEditable);
    };

    // redo
    this.redo = function(welEditable) {
      welEditable.data('NoteHistory').redo(welEditable);
    };

    // recordUndo
    var recordUndo = this.recordUndo = function(welEditable) {
      welEditable.data('NoteHistory').recordUndo(welEditable);
    };

    // native commands(with execCommand)
    var aCmd = ['bold', 'italic', 'underline', 'strikethrough',
                'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
                'insertOrderedList', 'insertUnorderedList',
                'indent', 'outdent', 'formatBlock', 'removeFormat',
                'backColor', 'foreColor', 'insertImage', 'insertHorizontalRule'];
    
    for (var idx = 0, len=aCmd.length; idx < len; idx ++) {
      this[aCmd[idx]] = function(sCmd) {
        return function(welEditable, sValue) {
          recordUndo(welEditable);
          document.execCommand(sCmd, false, sValue);
        };
      }(aCmd[idx]);
    }

    this.formatBlock = function(welEditable, sValue) {
      sValue = bMSIE ? '<' + sValue + '>' : sValue;
      document.execCommand('FormatBlock', false, sValue);
    };

    this.fontSize = function(welEditable, sValue) {
      recordUndo(welEditable);
      document.execCommand('fontSize', false, 3);
      // <font size='3'> to <font style='font-size={sValue}px;'>
      var welFont = welEditable.find('font[size=3]');
      welFont.removeAttr('size').css('font-size', sValue + 'px');
    };
    
    this.lineHeight = function(welEditable, sValue) {
      recordUndo(welEditable);
      style.stylePara(range.create(), {lineHeight: sValue});
    };

    this.unlink = function(welEditable) {
      var rng = range.create();
      if (rng.isOnAnchor()) {
        recordUndo(welEditable);
        var elAnchor = dom.ancestor(rng.sc, dom.isAnchor);
        rng = range.create(elAnchor, 0, elAnchor, 1);
        rng.select();
        document.execCommand('unlink');
      }
    };

    this.setLinkDialog = function(welEditable, fnShowDialog) {
      var rng = range.create();
      if (rng.isOnAnchor()) {
        var elAnchor = dom.ancestor(rng.sc, dom.isAnchor);
        rng = range.create(elAnchor, 0, elAnchor, 1);
      }
      fnShowDialog({
        range: rng,
        text: rng.toString(),
        url: rng.isOnAnchor() ? dom.ancestor(rng.sc, dom.isAnchor).href : ''
      }, function(sLinkUrl) {
        rng.select(); recordUndo(welEditable);

        var bProtocol = sLinkUrl.toLowerCase().indexOf('://') !== -1;
        var sLinkUrlWithProtocol = bProtocol ? sLinkUrl : 'http://' + sLinkUrl;

        //IE: createLink when range collapsed.
        if (bMSIE && rng.isCollapsed()) {
          rng.insertNode($('<A id="linkAnchor">' + sLinkUrl + '</A>')[0]);
          var welAnchor = $('#linkAnchor').removeAttr('id')
                                          .attr('href', sLinkUrlWithProtocol);
          rng = range.create(welAnchor[0], 0, welAnchor[0], 1);
          rng.select();
        } else {
          document.execCommand('createlink', false, sLinkUrlWithProtocol);
        }
      });
    };
    
    this.color = function(welEditable, sObjColor) {
      var oColor = JSON.parse(sObjColor);
      var foreColor = oColor.foreColor, backColor = oColor.backColor;

      recordUndo(welEditable);
      if (foreColor) { document.execCommand('foreColor', false, foreColor); }
      if (backColor) { document.execCommand('backColor', false, backColor); }
    };
    
    this.insertTable = function(welEditable, sDim) {
      recordUndo(welEditable);
      var aDim = sDim.split('x');
      var nCol = aDim[0], nRow = aDim[1];
      
      var aTD = [], sTD;
      var sWhitespace = bMSIE ? '&nbsp;' : '<br/>';
      for (var idxCol = 0; idxCol < nCol; idxCol++) {
        aTD.push('<td>' + sWhitespace + '</td>');
      }
      sTD = aTD.join('');

      var aTR = [], sTR;
      for (var idxRow = 0; idxRow < nRow; idxRow++) {
        aTR.push('<tr>' + sTD + '</tr>');
      }
      sTR = aTR.join('');
      var sTable = '<table class="table table-bordered">' + sTR + '</table>';
      range.create().insertNode($(sTable)[0]);
    };

    this.float = function(welEditable, sValue, elTarget) {
      recordUndo(welEditable);
      elTarget.style.cssFloat = sValue;
    };

    this.resize = function(welEditable, sValue, elTarget) {
      recordUndo(welEditable);
      elTarget.style.width = welEditable.width() * sValue + 'px';
      elTarget.style.height = '';
    };

    this.resizeTo = function(pos, welTarget) {
      var newRatio = pos.y / pos.x;
      var ratio = welTarget.data('ratio');

      welTarget.css({
        width: ratio > newRatio ? pos.x : pos.y / ratio,
        height: ratio > newRatio ? pos.x * ratio : pos.y
      });
    };
  };

  /**
   * Toolbar
   */
  var Toolbar = function() {
    this.update = function(welToolbar, oStyle) {
      //handle selectbox for fontsize, lineHeight
      var checkDropdownMenu = function(welBtn, nValue) {
        welBtn.find('.dropdown-menu li a').each(function() {
          var bChecked = $(this).attr('data-value') == nValue;
          this.className = bChecked ? 'checked' : '';
        });
      };
      
      var welFontsize = welToolbar.find('.note-fontsize');
      welFontsize.find('.note-current-fontsize').html(oStyle['font-size']);
      checkDropdownMenu(welFontsize, parseFloat(oStyle['font-size']));
      
      var welLineHeight = welToolbar.find('.note-height');
      checkDropdownMenu(welLineHeight, parseFloat(oStyle['line-height']));
      
      //check button state
      var btnState = function(sSelector, pred) {
        var welBtn = welToolbar.find(sSelector);
        welBtn[pred() ? 'addClass' : 'removeClass']('active');
      };

      btnState('button[data-event="bold"]', function() {
        return oStyle['font-bold'] === 'bold';
      });
      btnState('button[data-event="italic"]', function() {
        return oStyle['font-italic'] === 'italic';
      });
      btnState('button[data-event="underline"]', function() {
        return oStyle['font-underline'] === 'underline';
      });
      btnState('button[data-event="justifyLeft"]', function() {
        return oStyle['text-align'] === 'left' || oStyle['text-align'] === 'start';
      });
      btnState('button[data-event="justifyCenter"]', function() {
        return oStyle['text-align'] === 'center';
      });
      btnState('button[data-event="justifyRight"]', function() {
        return oStyle['text-align'] === 'right';
      });
      btnState('button[data-event="justifyFull"]', function() {
        return oStyle['text-align'] === 'justify';
      });
      btnState('button[data-event="insertUnorderedList"]', function() {
        return oStyle['list-style'] === 'unordered';
      });
      btnState('button[data-event="insertOrderedList"]', function() {
        return oStyle['list-style'] === 'ordered';
      });
    };
    
    this.updateRecentColor = function(elBtn, sEvent, sValue) {
      var welColor = $(elBtn).closest('.note-color');
      var welRecentColor = welColor.find('.note-recent-color');
      var oColor = JSON.parse(welRecentColor.attr('data-value'));
      oColor[sEvent] = sValue;
      welRecentColor.attr('data-value', JSON.stringify(oColor));
      var sKey = sEvent === 'backColor' ? 'background-color' : 'color';
      welRecentColor.find('i').css(sKey, sValue);
    };

    this.updateFullscreen = function(welToolbar, bFullscreen) {
      var welBtn = welToolbar.find('button[data-event="fullscreen"]');
      welBtn[bFullscreen ? 'addClass' : 'removeClass']('active');
    };
    this.updateCodeview = function(welToolbar, bCodeview) {
      var welBtn = welToolbar.find('button[data-event="codeview"]');
      welBtn[bCodeview ? 'addClass' : 'removeClass']('active');
    };

    this.enable = function(welToolbar) {
      welToolbar.find('button').not('button[data-event="codeview"]').removeClass('disabled');
    };

    this.disable = function(welToolbar) {
      welToolbar.find('button').not('button[data-event="codeview"]').addClass('disabled');
    };
  };
  
  /**
   * Popover
   */
  var Popover = function() {
    var showPopover = function(welPopover, elPlaceholder) {
      var welPlaceHolder = $(elPlaceholder);
      var pos = welPlaceHolder.position(), height = welPlaceHolder.height();
      welPopover.css({
        display: 'block',
        left: pos.left,
        top: pos.top + height
      });
    };

    this.update = function(welPopover, oStyle) {
      var welLinkPopover = welPopover.find('.note-link-popover'),
          welImagePopover = welPopover.find('.note-image-popover');
      if (oStyle.anchor) {
        var welAnchor = welLinkPopover.find('a');
        welAnchor.attr('href', oStyle.anchor.href).html(oStyle.anchor.href);
        showPopover(welLinkPopover, oStyle.anchor);
      } else {
        welLinkPopover.hide();
      }

      if (oStyle.image) {
        showPopover(welImagePopover, oStyle.image);
      } else {
        welImagePopover.hide();
      }
    };
    
    this.hide = function(welPopover) {
      welPopover.children().hide();
    };
  };

  /**
   * Handle
   */
  var Handle = function() {
    this.update = function(welHandle, oStyle) {
      var welSelection = welHandle.find('.note-control-selection');
      if (oStyle.image) {
        var welImage = $(oStyle.image);
        var pos = welImage.position();
        var szImage = {w: welImage.width(), h: welImage.height()};
        welSelection.css({
          display: 'block',
          left: pos.left, top: pos.top,
          width: szImage.w, height: szImage.h
        }).data('target', oStyle.image); // save current image element.
        var sSizing = szImage.w + 'x' + szImage.h;
        welSelection.find('.note-control-selection-info').text(sSizing);
      } else {
        welSelection.hide();
      }
    };

    this.hide = function(welHandle) {
      welHandle.children().hide();
    };
  };
  
  /**
   * Dialog
   */
  var Dialog = function() {
    this.showImageDialog = function(welDialog, hDropImage, fnInsertImages) {
      var welImageDialog = welDialog.find('.note-image-dialog');
      var welDropzone = welDialog.find('.note-dropzone'),
          welImageInput = welDialog.find('.note-image-input');

      welImageDialog.on('shown.bs.modal', function(e) {
        welDropzone.on('dragenter dragover dragleave', false);
        welDropzone.on('drop', function(e) {
          hDropImage(e); welImageDialog.modal('hide');
        });
        welImageInput.on('change', function(event) {
          fnInsertImages(this.files); $(this).val('');
          welImageDialog.modal('hide');
        });
      }).on('hidden.bs.modal', function(e) {
        welDropzone.off('dragenter dragover dragleave drop');
        welImageInput.off('change');
        welImageDialog.off('shown.bs.modal hidden.bs.modal');
      }).modal('show');
    };

    this.showLinkDialog = function(welDialog, linkInfo, callback) {
      var welLinkDialog = welDialog.find('.note-link-dialog');
      var welLinkText = welLinkDialog.find('.note-link-text'),
          welLinkUrl = welLinkDialog.find('.note-link-url'),
          welLinkBtn = welLinkDialog.find('.note-link-btn');

      welLinkDialog.on('shown.bs.modal', function(e) {
        welLinkText.html(linkInfo.text);
        welLinkUrl.val(linkInfo.url).keyup(function(event) {
          if (welLinkUrl.val()) {
            welLinkBtn.removeClass('disabled').attr('disabled', false);
          } else {
            welLinkBtn.addClass('disabled').attr('disabled', true);
          }

          if (!linkInfo.text) { welLinkText.html(welLinkUrl.val()); };
        }).trigger('focus');
        welLinkBtn.click(function(event) {
          welLinkDialog.modal('hide'); //hide and createLink (ie9+)
          callback(welLinkUrl.val());
          event.preventDefault();
        });
      }).on('hidden.bs.modal', function(e) {
        welLinkUrl.off('keyup');
        welLinkBtn.off('click');
        welLinkDialog.off('shown.bs.modal hidden.bs.modal');
      }).modal('show');
    };

    this.showHelpDialog = function(welDialog) {
      welDialog.find('.note-help-dialog').modal('show');
    };
  };
  
  /**
   * EventHandler
   *
   * handle mouse & key event on note
   */
  var EventHandler = function() {
    var editor = new Editor();
    var toolbar = new Toolbar(), popover = new Popover();
    var handle = new Handle(), dialog = new Dialog();
    
    var key = { BACKSPACE: 8, TAB: 9, ENTER: 13, SPACE: 32,
                NUM0: 48, NUM1: 49, NUM6: 54, NUM7: 55, NUM8: 56, 
                B: 66, E: 69, I: 73, J: 74, K: 75, L: 76, R: 82, S: 83, U: 85,
                Y: 89, Z: 90, SLASH: 191,
                LEFTBRACKET: 219, BACKSLACH: 220, RIGHTBRACKET: 221 };

    // makeLayoutInfo from editor's descendant node.
    var makeLayoutInfo = function(descendant) {
      var welEditor = $(descendant).closest('.note-editor');
      return {
        editor: function() { return welEditor; },
        toolbar: function() { return welEditor.find('.note-toolbar'); },
        editable: function() { return welEditor.find('.note-editable'); },
        codeable: function() { return welEditor.find('.note-codeable'); },
        statusbar: function() { return welEditor.find('.note-statusbar'); },
        popover: function() { return welEditor.find('.note-popover'); },
        handle: function() { return welEditor.find('.note-handle'); },
        dialog: function() { return welEditor.find('.note-dialog'); }
      };
    };

    var hKeydown = function(event) {
      var bCmd = bMac ? event.metaKey : event.ctrlKey,
          bShift = event.shiftKey, keyCode = event.keyCode;

      // optimize
      var bExecCmd = (bCmd || bShift || keyCode === key.TAB);
      var oLayoutInfo = (bExecCmd) ? makeLayoutInfo(event.target) : null;

      if (keyCode === key.TAB && oLayoutInfo.editable().data('tabsize')) {
        editor.tab(oLayoutInfo.editable());
      } else if (bCmd && ((bShift && keyCode === key.Z) || keyCode === key.Y)) {
        editor.redo(oLayoutInfo.editable());
      } else if (bCmd && keyCode === key.Z) {
        editor.undo(oLayoutInfo.editable());
      } else if (bCmd && keyCode === key.B) {
        editor.bold(oLayoutInfo.editable());
      } else if (bCmd && keyCode === key.I) {
        editor.italic(oLayoutInfo.editable());
      } else if (bCmd && keyCode === key.U) {
        editor.underline(oLayoutInfo.editable());
      } else if (bCmd && bShift && keyCode === key.S) {
        editor.strikethrough(oLayoutInfo.editable());
      } else if (bCmd && keyCode === key.BACKSLACH) {
        editor.removeFormat(oLayoutInfo.editable());
      } else if (bCmd && keyCode === key.K) {
        editor.setLinkDialog(oLayoutInfo.editable(), function(linkInfo, cb) {
          dialog.showLinkDialog(oLayoutInfo.dialog(), linkInfo, cb);
        });
      } else if (bCmd && keyCode === key.SLASH) {
        dialog.showHelpDialog(oLayoutInfo.dialog());
      } else if (bCmd && bShift && keyCode === key.L) {
        editor.justifyLeft(oLayoutInfo.editable());
      } else if (bCmd && bShift && keyCode === key.E) {
        editor.justifyCenter(oLayoutInfo.editable());
      } else if (bCmd && bShift && keyCode === key.R) {
        editor.justifyRight(oLayoutInfo.editable());
      } else if (bCmd && bShift && keyCode === key.J) {
        editor.justifyFull(oLayoutInfo.editable());
      } else if (bCmd && bShift && keyCode === key.NUM7) {
        editor.insertUnorderedList(oLayoutInfo.editable());
      } else if (bCmd && bShift && keyCode === key.NUM8) {
        editor.insertOrderedList(oLayoutInfo.editable());
      } else if (bCmd && keyCode === key.LEFTBRACKET) {
        editor.outdent(oLayoutInfo.editable());
      } else if (bCmd && keyCode === key.RIGHTBRACKET) {
        editor.indent(oLayoutInfo.editable());
      } else if (bCmd && keyCode === key.NUM0) { // formatBlock Paragraph
        editor.formatBlock(oLayoutInfo.editable(), 'P');
      } else if (bCmd && (key.NUM1 <= keyCode && keyCode <= key.NUM6)) {
        var sHeading = 'H' + String.fromCharCode(keyCode); // H1~H6
        editor.formatBlock(oLayoutInfo.editable(), sHeading);
      } else if (bCmd && keyCode === key.ENTER) {
        editor.insertHorizontalRule(oLayoutInfo.editable());
      } else {
        if (keyCode === key.BACKSPACE || keyCode === key.ENTER ||
            keyCode === key.SPACE) {
          editor.recordUndo(makeLayoutInfo(event.target).editable());
        }
        return; // not matched
      }
      event.preventDefault(); //prevent default event for FF
    };

    var insertImages = function(welEditable, files) {
      welEditable.trigger('focus');
      $.each(files, function(idx, file) {
        var fileReader = new FileReader;
        fileReader.onload = function(event) {
          editor.insertImage(welEditable, event.target.result); // sURL
        };
        fileReader.readAsDataURL(file);
      });
    };

    var hDropImage = function(event) {
      var dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer && dataTransfer.files) {
        var oLayoutInfo = makeLayoutInfo(event.currentTarget || event.target);
        insertImages(oLayoutInfo.editable(), dataTransfer.files);
      }
      event.stopPropagation();
      event.preventDefault();
    };

    var hMousedown = function(event) {
      //preventDefault Selection for FF, IE8+
      if (dom.isImg(event.target)) { event.preventDefault(); };
    };
    
    var hToolbarAndPopoverUpdate = function(event) {
      var oLayoutInfo = makeLayoutInfo(event.currentTarget || event.target);
      var oStyle = editor.currentStyle(event.target);
      if (!oStyle) { return; }
      toolbar.update(oLayoutInfo.toolbar(), oStyle);
      popover.update(oLayoutInfo.popover(), oStyle);
      handle.update(oLayoutInfo.handle(), oStyle);
    };

    var hScroll = function(event) {
      var oLayoutInfo = makeLayoutInfo(event.currentTarget || event.target);
      //hide popover and handle when scrolled
      popover.hide(oLayoutInfo.popover());
      handle.hide(oLayoutInfo.handle());
    };

    var hHandleMousedown = function(event) {
      if (dom.isControlSizing(event.target)) {
        var oLayoutInfo = makeLayoutInfo(event.target),
            welHandle = oLayoutInfo.handle(), welPopover = oLayoutInfo.popover(),
            welEditable = oLayoutInfo.editable(), welEditor = oLayoutInfo.editor();

        var elTarget = welHandle.find('.note-control-selection').data('target'),
            welTarget = $(elTarget);
        var posStart = welTarget.offset(),
            scrollTop = $(document).scrollTop(), posDistance;

        welEditor.on('mousemove', function(event) {
          posDistance = {x: event.clientX - posStart.left,
                         y: event.clientY - (posStart.top - scrollTop)};
          editor.resizeTo(posDistance, welTarget);
          handle.update(welHandle, {image: elTarget});
          popover.update(welPopover, {image: elTarget});
        }).on('mouseup', function() {
          welEditor.off('mousemove').off('mouseup');
        });

        if (!welTarget.data('ratio')) { // original ratio.
          welTarget.data('ratio', welTarget.height() / welTarget.width());
        }

        editor.recordUndo(welEditable);
        event.stopPropagation(); event.preventDefault();
      }
    };
    
    var hToolbarAndPopoverMousedown = function(event) {
      // prevent default event when insertTable (FF, Webkit)
      var welBtn = $(event.target).closest('[data-event]');
      if (welBtn.length > 0) { event.preventDefault(); }
    };
    
    var hToolbarAndPopoverClick = function(event) {
      var welBtn = $(event.target).closest('[data-event]');
      
      if (welBtn.length > 0) {
        var sEvent = welBtn.attr('data-event'),
            sValue = welBtn.attr('data-value');

        var oLayoutInfo = makeLayoutInfo(event.target);
        var welDialog = oLayoutInfo.dialog(),
            welEditable = oLayoutInfo.editable(),
            welCodeable = oLayoutInfo.codeable();

        // before command
        var elTarget;
        if ($.inArray(sEvent, ['resize', 'float']) !== -1) {
          var welHandle = oLayoutInfo.handle();
          var welSelection = welHandle.find('.note-control-selection');
          elTarget = welSelection.data('target');
        }

        if (editor[sEvent]) { // on command
          welEditable.trigger('focus');
          editor[sEvent](welEditable, sValue, elTarget);
        }
        
        // after command
        if ($.inArray(sEvent, ['backColor', 'foreColor']) !== -1) {
          toolbar.updateRecentColor(welBtn[0], sEvent, sValue);
        } else if (sEvent === 'showLinkDialog') { // popover to dialog
          editor.setLinkDialog(welEditable, function(linkInfo, cb) {
            dialog.showLinkDialog(welDialog, linkInfo, cb);
          });
        } else if (sEvent === 'showImageDialog') {
          dialog.showImageDialog(welDialog, hDropImage, function(files) {
            insertImages(welEditable, files);
          });
        } else if (sEvent === 'showHelpDialog') {
          dialog.showHelpDialog(welDialog);
        } else if (sEvent === 'fullscreen') {
          var welEditor = oLayoutInfo.editor();
          welEditor.toggleClass('fullscreen');

          var welToolbar = oLayoutInfo.toolbar();
          var hResizeFullscreen = function() {
            var nHeight = $(window).height() - welToolbar.outerHeight();
            welEditable.css('height', nHeight);
          }

          var bFullscreen = welEditor.hasClass('fullscreen');
          if (bFullscreen) {
            welEditable.data('orgHeight', welEditable.css('height'));
            $(window).resize(hResizeFullscreen).trigger('resize');
          } else {
            welEditable.css('height', welEditable.data('orgHeight'));
            $(window).off('resize');
          }

          toolbar.updateFullscreen(welToolbar, bFullscreen);
        } else if (sEvent === 'codeview') {
          var welEditor = oLayoutInfo.editor(),
              welToolbar = oLayoutInfo.toolbar();
          welEditor.toggleClass('codeview');

          var bCodeview = welEditor.hasClass('codeview')
          if (bCodeview) {
            welCodeable.val(welEditable.html());
            welCodeable.height(welEditable.height());
            toolbar.disable(welToolbar);
            welCodeable.focus();
          } else {
            welEditable.html(welCodeable.val());
            welEditable.height(welCodeable.height());
            toolbar.enable(welToolbar);
            welEditable.focus();
          }

          toolbar.updateCodeview(oLayoutInfo.toolbar(), bCodeview);
        }

        hToolbarAndPopoverUpdate(event);
      }
    };

    var EDITABLE_PADDING = 24;
    var hStatusbarMousedown = function(event) {
      var welDocument = $(document);
      var oLayoutInfo = makeLayoutInfo(event.target);
      var welEditable = oLayoutInfo.editable(),
          welCodeable = oLayoutInfo.codeable();

      var nEditableTop = welEditable.offset().top - welDocument.scrollTop();
      var hMousemove = function(event) {
        welEditable.height(event.clientY - (nEditableTop + EDITABLE_PADDING));
      };
      var hMouseup = function() {
        welDocument.unbind('mousemove', hMousemove)
                   .unbind('mouseup', hMouseup);
      }
      welDocument.mousemove(hMousemove).mouseup(hMouseup);
      event.stopPropagation(); event.preventDefault();
    };
    
    var PX_PER_EM = 18;
    var hDimensionPickerMove = function(event) {
      var welPicker = $(event.target.parentNode); // target is mousecatcher
      var welDimensionDisplay = welPicker.next();
      var welCatcher = welPicker.find('.note-dimension-picker-mousecatcher');
      var welHighlighted = welPicker.find('.note-dimension-picker-highlighted');
      var welUnhighlighted = welPicker.find('.note-dimension-picker-unhighlighted');
      var posOffset;
      if (event.offsetX === undefined) {
        // HTML5 with jQuery - e.offsetX is undefined in Firefox
        var posCatcher = $(event.target).offset();
        posOffset = {x: event.pageX - posCatcher.left,
                     y: event.pageY - posCatcher.top};
      } else {
        posOffset = {x: event.offsetX, y: event.offsetY};
      }
      
      var dim = {c: Math.ceil(posOffset.x / PX_PER_EM) || 1,
                 r: Math.ceil(posOffset.y / PX_PER_EM) || 1};

      welHighlighted.css({ width: dim.c +'em', height: dim.r + 'em' });
      welCatcher.attr('data-value', dim.c + 'x' + dim.r);
      
      if (3 < dim.c && dim.c < 10) { // 5~10
        welUnhighlighted.css({ width: dim.c + 1 + 'em'});
      }

      if (3 < dim.r && dim.r < 10) { // 5~10
        welUnhighlighted.css({ height: dim.r + 1 + 'em'});
      }

      welDimensionDisplay.html(dim.c + ' x ' + dim.r);
    };

    this.attach = function(oLayoutInfo, options) {
      oLayoutInfo.editable.on('keydown', hKeydown);
      oLayoutInfo.editable.on('mousedown', hMousedown);
      oLayoutInfo.editable.on('keyup mouseup', hToolbarAndPopoverUpdate);
      oLayoutInfo.editable.on('scroll', hScroll);
      //TODO: handle Drag point
      oLayoutInfo.editable.on('dragenter dragover dragleave', false);
      oLayoutInfo.editable.on('drop', hDropImage);

      oLayoutInfo.handle.on('mousedown', hHandleMousedown);

      oLayoutInfo.toolbar.on('click', hToolbarAndPopoverClick);
      oLayoutInfo.popover.on('click', hToolbarAndPopoverClick);
      oLayoutInfo.toolbar.on('mousedown', hToolbarAndPopoverMousedown);
      oLayoutInfo.popover.on('mousedown', hToolbarAndPopoverMousedown);

      oLayoutInfo.statusbar.on('mousedown', hStatusbarMousedown);
      
      //toolbar table dimension
      var welToolbar = oLayoutInfo.toolbar;
      var welCatcher = welToolbar.find('.note-dimension-picker-mousecatcher');
      welCatcher.on('mousemove', hDimensionPickerMove);

      // callback
      // init, enter, !change, !pasteBefore, !pasteAfter, focus, blur, keyup, keydown
      if (options.onenter) {
        oLayoutInfo.editable.keypress(function(event) {
          if (event.keyCode === key.ENTER) { options.onenter(event);}
        });
      }
      if (options.onfocus) { oLayoutInfo.editable.focus(options.onfocus); }
      if (options.onblur) { oLayoutInfo.editable.blur(options.onblur); }
      if (options.onkeyup) { oLayoutInfo.editable.keyup(options.onkeyup); }
      if (options.onkeydown) { oLayoutInfo.editable.keydown(options.onkeydown); }

      // TODO: callback for advanced features
      // autosave, impageUpload, imageUploadError, fileUpload, fileUploadError
    };

    this.dettach = function(oLayoutInfo) {
      oLayoutInfo.editable.off();
      oLayoutInfo.toolbar.off();
      oLayoutInfo.handle.off();
      oLayoutInfo.popover.off();
    };
  };

  /**
   * Renderer
   *
   * rendering toolbar and editable
   */
  var Renderer = function() {
    var aToolbarItem = {
      picture:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Picture" data-event="showImageDialog" tabindex="-1"><i class="icon-picture"></i></button>',
      link:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Link" data-event="showLinkDialog" data-shortcut="Ctrl+K" data-mac-shortcut="⌘+K" tabindex="-1"><i class="icon-link"></i></button>',
      table:
        '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" title="Table" data-toggle="dropdown" tabindex="-1"><i class="icon-table"></i> <span class="caret"></span></button>' +
        '<ul class="dropdown-menu">' +
        '<div class="note-dimension-picker">' +
        '<div class="note-dimension-picker-mousecatcher" data-event="insertTable" data-value="1x1"></div>' +
        '<div class="note-dimension-picker-highlighted"></div>' +
        '<div class="note-dimension-picker-unhighlighted"></div>' +
        '</div>' +
        '<div class="note-dimension-display"> 1 x 1 </div>' +
        '</ul>',
      style:
        '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" title="Style" data-toggle="dropdown" tabindex="-1"><i class="icon-magic"></i> <span class="caret"></span></button>' +
        '<ul class="dropdown-menu">' +
        '<li><a data-event="formatBlock" data-value="p">Normal</a></li>' +
        '<li><a data-event="formatBlock" data-value="blockquote"><blockquote>Quote</blockquote></a></li>' +
        '<li><a data-event="formatBlock" data-value="pre">Code</a></li>' +
        '<li><a data-event="formatBlock" data-value="h1"><h1>Header 1</h1></a></li>' +
        '<li><a data-event="formatBlock" data-value="h2"><h2>Header 2</h2></a></li>' +
        '<li><a data-event="formatBlock" data-value="h3"><h3>Header 3</h3></a></li>' +
        '<li><a data-event="formatBlock" data-value="h4"><h4>Header 4</h4></a></li>' +
        '<li><a data-event="formatBlock" data-value="h5"><h5>Header 5</h5></a></li>' +
        '<li><a data-event="formatBlock" data-value="h6"><h6>Header 6</h6></a></li>' +
        '</ul>',
      fontsize:
        '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" data-toggle="dropdown" title="Font Size" tabindex="-1"><span class="note-current-fontsize">11</span> <b class="caret"></b></button>' +
        '<ul class="dropdown-menu">' +
        '<li><a data-event="fontSize" data-value="8"><i class="icon-ok"></i> 8</a></li>' +
        '<li><a data-event="fontSize" data-value="9"><i class="icon-ok"></i> 9</a></li>' +
        '<li><a data-event="fontSize" data-value="10"><i class="icon-ok"></i> 10</a></li>' +
        '<li><a data-event="fontSize" data-value="11"><i class="icon-ok"></i> 11</a></li>' +
        '<li><a data-event="fontSize" data-value="12"><i class="icon-ok"></i> 12</a></li>' +
        '<li><a data-event="fontSize" data-value="14"><i class="icon-ok"></i> 14</a></li>' +
        '<li><a data-event="fontSize" data-value="18"><i class="icon-ok"></i> 18</a></li>' +
        '<li><a data-event="fontSize" data-value="24"><i class="icon-ok"></i> 24</a></li>' +
        '<li><a data-event="fontSize" data-value="36"><i class="icon-ok"></i> 36</a></li>' +
        '</ul>',
      color:
        '<button type="button" class="btn btn-default btn-sm btn-small note-recent-color" title="Recent Color" data-event="color" data-value=\'{"backColor":"yellow"}\' tabindex="-1"><i class="icon-font" style="color:black;background-color:yellow;"></i></button>' +
        '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" title="More Color" data-toggle="dropdown" tabindex="-1">' +
        '<span class="caret"></span>' +
        '</button>' +
        '<ul class="dropdown-menu">' +
        '<li>' +
        '<div class="btn-group">' +
        '<div class="note-palette-title">BackColor</div>' +
        '<div class="note-color-reset" data-event="backColor" data-value="inherit" title="Transparent">Set transparent</div>' +
        '<div class="note-color-palette" data-target-event="backColor"></div>' +
        '</div>' +
        '<div class="btn-group">' +
        '<div class="note-palette-title">FontColor</div>' +
        '<div class="note-color-reset" data-event="foreColor" data-value="inherit" title="Reset">Reset to default</div>' +
        '<div class="note-color-palette" data-target-event="foreColor"></div>' +
        '</div>' +
        '</li>' +
        '</ul>',
      bold:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Bold" data-shortcut="Ctrl+B" data-mac-shortcut="⌘+B" data-event="bold" tabindex="-1"><i class="icon-bold"></i></button>',
      italic:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Italic" data-shortcut="Ctrl+I" data-mac-shortcut="⌘+I" data-event="italic" tabindex="-1"><i class="icon-italic"></i></button>',
      underline:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Underline" data-shortcut="Ctrl+U" data-mac-shortcut="⌘+U" data-event="underline" tabindex="-1"><i class="icon-underline"></i></button>',
      clear:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Remove Font Style" data-shortcut="Ctrl+\\" data-mac-shortcut="⌘+\\" data-event="removeFormat" tabindex="-1"><i class="icon-eraser"></i></button>',
      ul:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Unordered list" data-shortcut="Ctrl+Shift+8" data-mac-shortcut="⌘+⇧+7" data-event="insertUnorderedList" tabindex="-1"><i class="icon-list-ul"></i></button>',
      ol:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Ordered list" data-shortcut="Ctrl+Shift+7" data-mac-shortcut="⌘+⇧+8" data-event="insertOrderedList" tabindex="-1"><i class="icon-list-ol"></i></button>',
      paragraph:
        '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" title="Paragraph" data-toggle="dropdown" tabindex="-1"><i class="icon-align-left"></i>  <span class="caret"></span></button>' +
        '<ul class="dropdown-menu">' +
          '<li>' +
          '<div class="note-align btn-group">' +
          '<button type="button" class="btn btn-default btn-sm btn-small" title="Align left" data-shortcut="Ctrl+Shift+L" data-mac-shortcut="⌘+⇧+L" data-event="justifyLeft" tabindex="-1"><i class="icon-align-left"></i></button>' +
          '<button type="button" class="btn btn-default btn-sm btn-small" title="Align center" data-shortcut="Ctrl+Shift+E" data-mac-shortcut="⌘+⇧+E" data-event="justifyCenter" tabindex="-1"><i class="icon-align-center"></i></button>' +
          '<button type="button" class="btn btn-default btn-sm btn-small" title="Align right" data-shortcut="Ctrl+Shift+R" data-mac-shortcut="⌘+⇧+R" data-event="justifyRight" tabindex="-1"><i class="icon-align-right"></i></button>' +
          '<button type="button" class="btn btn-default btn-sm btn-small" title="Justify full" data-shortcut="Ctrl+Shift+J" data-mac-shortcut="⌘+⇧+J" data-event="justifyFull" tabindex="-1"><i class="icon-align-justify"></i></button>' +
          '</div>' +
          '</li>' +
          '<li>' +
          '<div class="note-list btn-group">' +
          '<button type="button" class="btn btn-default btn-sm btn-small" title="Outdent" data-shortcut="Ctrl+[" data-mac-shortcut="⌘+[" data-event="outdent" tabindex="-1"><i class="icon-indent-left"></i></button>' +
          '<button type="button" class="btn btn-default btn-sm btn-small" title="Indent" data-shortcut="Ctrl+]" data-mac-shortcut="⌘+]" data-event="indent" tabindex="-1"><i class="icon-indent-right"></i></button>' +
          '</li>' +
        '</ul>',
      height:
        '<button type="button" class="btn btn-default btn-sm btn-small dropdown-toggle" data-toggle="dropdown" title="Line Height" tabindex="-1"><i class="icon-text-height"></i>&nbsp; <b class="caret"></b></button>' +
        '<ul class="dropdown-menu">' +
        '<li><a data-event="lineHeight" data-value="1.0"><i class="icon-ok"></i> 1.0</a></li>' +
        '<li><a data-event="lineHeight" data-value="1.2"><i class="icon-ok"></i> 1.2</a></li>' +
        '<li><a data-event="lineHeight" data-value="1.4"><i class="icon-ok"></i> 1.4</a></li>' +
        '<li><a data-event="lineHeight" data-value="1.5"><i class="icon-ok"></i> 1.5</a></li>' +
        '<li><a data-event="lineHeight" data-value="1.6"><i class="icon-ok"></i> 1.6</a></li>' +
        '<li><a data-event="lineHeight" data-value="1.8"><i class="icon-ok"></i> 1.8</a></li>' +
        '<li><a data-event="lineHeight" data-value="2.0"><i class="icon-ok"></i> 2.0</a></li>' +
        '<li><a data-event="lineHeight" data-value="3.0"><i class="icon-ok"></i> 3.0</a></li>' +
        '</ul>',
      help:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Help" data-shortcut="Ctrl+/" data-mac-shortcut="⌘+/" data-event="showHelpDialog" tabindex="-1"><i class="icon-question"></i></button>',
      fullscreen:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Full Screen" data-event="fullscreen" tabindex="-1"><i class="icon-fullscreen"></i></button>',
      codeview:
        '<button type="button" class="btn btn-default btn-sm btn-small" title="Code View" data-event="codeview" tabindex="-1"><i class="icon-code"></i></button>'
    };
    var sPopover = '<div class="note-popover">' +
                     '<div class="note-link-popover popover bottom in" style="display: none;">' +
                       '<div class="arrow"></div>' +
                       '<div class="popover-content note-link-content">' +
                         '<a href="http://www.google.com" target="_blank">www.google.com</a>&nbsp;&nbsp;' +
                         '<div class="note-insert btn-group">' +
                         '<button type="button" class="btn btn-default btn-sm btn-small" title="Edit" data-event="showLinkDialog" tabindex="-1"><i class="icon-edit"></i></button>' +
                         '<button type="button" class="btn btn-default btn-sm btn-small" title="Unlink" data-event="unlink" tabindex="-1"><i class="icon-unlink"></i></button>' +
                         '</div>' +
                       '</div>' +
                     '</div>' +
                     '<div class="note-image-popover popover bottom in" style="display: none;">' +
                       '<div class="arrow"></div>' +
                       '<div class="popover-content note-image-content">' +
                         '<div class="btn-group">' +
                           '<button type="button" class="btn btn-default btn-sm btn-small" title="Resize Full" data-event="resize" data-value="1" tabindex="-1"><i class="icon-resize-full"></i></button>' +
                           '<button type="button" class="btn btn-default btn-sm btn-small" title="Resize Half" data-event="resize" data-value="0.5" tabindex="-1">½</button>' +
                           '<button type="button" class="btn btn-default btn-sm btn-small" title="Resize Thrid" data-event="resize" data-value="0.33" tabindex="-1">⅓</button>' +
                           '<button type="button" class="btn btn-default btn-sm btn-small" title="Resize Quarter" data-event="resize" data-value="0.25" tabindex="-1">¼</button>' +
                         '</div>' +
                         '<div class="btn-group">' +
                           '<button type="button" class="btn btn-default btn-sm btn-small" title="Float Left" data-event="float" data-value="left" tabindex="-1"><i class="icon-align-left"></i></button>' +
                           '<button type="button" class="btn btn-default btn-sm btn-small" title="Float Right" data-event="float" data-value="right" tabindex="-1"><i class="icon-align-right"></i></button>' +
                           '<button type="button" class="btn btn-default btn-sm btn-small" title="Float None" data-event="float" data-value="none" tabindex="-1"><i class="icon-reorder"></i></button>' +
                         '</div>' +
                       '</div>' +
                     '</div>' +
                   '</div>';

    var sHandle = '<div class="note-handle">' +
                    '<div class="note-control-selection">' +
                      '<div class="note-control-selection-bg"></div>' +
                      '<div class="note-control-holder note-control-nw"></div>' +
                      '<div class="note-control-holder note-control-ne"></div>' +
                      '<div class="note-control-holder note-control-sw"></div>' +
                      '<div class="note-control-sizing note-control-se"></div>' +
                      '<div class="note-control-selection-info"></div>' +
                    '</div>' +
                  '</div>';

    var sShortcutText = '<table class="note-shortcut">' +
                           '<thead>' +
                             '<tr><th></th><th>Text formatting</th></tr>' +
                           '</thead>' +
                           '<tbody>' +
                             '<tr><td>⌘ + B</td><td>Toggle Bold</td></tr>' +
                             '<tr><td>⌘ + I</td><td>Toggle Italic</td></tr>' +
                             '<tr><td>⌘ + U</td><td>Toggle Underline</td></tr>' +
                             '<tr><td>⌘ + ⇧ + S</td><td>Toggle Strike</td></tr>' +
                             '<tr><td>⌘ + \\</td><td>Remove Font Style</td></tr>' +
                             '</tr>' +
                           '</tbody>' +
                         '</table>';

    var sShortcutAction = '<table class="note-shortcut">' +
                           '<thead>' +
                             '<tr><th></th><th>Action</th></tr>' +
                           '</thead>' +
                           '<tbody>' +
                             '<tr><td>⌘ + Z</td><td>Undo</td></tr>' +
                             '<tr><td>⌘ + ⇧ + Z</td><td>Redo</td></tr>' +
                             '<tr><td>⌘ + ]</td><td>Indent</td></tr>' +
                             '<tr><td>⌘ + [</td><td>Outdent</td></tr>' +
                             '<tr><td>⌘ + K</td><td>Insert Link</td></tr>' +
                             '<tr><td>⌘ + ENTER</td><td>Insert Horizontal Rule</td></tr>' +
                           '</tbody>' +
                         '</table>';

    var sShortcutPara = '<table class="note-shortcut">' +
                          '<thead>' +
                            '<tr><th></th><th>Paragraph formatting</th></tr>' +
                          '</thead>' +
                          '<tbody>' +
                            '<tr><td>⌘ + ⇧ + L</td><td>Align Left</td></tr>' +
                            '<tr><td>⌘ + ⇧ + E</td><td>Align Center</td></tr>' +
                            '<tr><td>⌘ + ⇧ + R</td><td>Align Right</td></tr>' +
                            '<tr><td>⌘ + ⇧ + J</td><td>Justify Full</td></tr>' +
                            '<tr><td>⌘ + ⇧ + NUM7</td><td>Ordered List</td></tr>' +
                            '<tr><td>⌘ + ⇧ + NUM8</td><td>Unordered List</td></tr>' +
                          '</tbody>' +
                        '</table>';

    var sShortcutStyle = '<table class="note-shortcut">' +
                           '<thead>' +
                             '<tr><th></th><th>Document Style</th></tr>' +
                           '</thead>' +
                           '<tbody>' +
                             '<tr><td>⌘ + NUM0</td><td>Normal Text</td></tr>' +
                             '<tr><td>⌘ + NUM1</td><td>Heading 1</td></tr>' +
                             '<tr><td>⌘ + NUM2</td><td>Heading 2</td></tr>' +
                             '<tr><td>⌘ + NUM3</td><td>Heading 3</td></tr>' +
                             '<tr><td>⌘ + NUM4</td><td>Heading 4</td></tr>' +
                             '<tr><td>⌘ + NUM5</td><td>Heading 5</td></tr>' +
                             '<tr><td>⌘ + NUM6</td><td>Heading 6</td></tr>' +
                           '</tbody>' +
                         '</table>';

    var sShortcutTable = '<table class="note-shortcut-layout">' +
                           '<tbody>' +
                             '<tr><td>' + sShortcutAction +'</td><td>' + sShortcutText +'</td></tr>' +
                             '<tr><td>' + sShortcutStyle +'</td><td>' + sShortcutPara +'</td></tr>' +
                           '</tbody>' +
                         '</table>';

    var sDialog = '<div class="note-dialog">' +
                    '<div class="note-image-dialog modal" aria-hidden="false">' +
                      '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                          '<div class="modal-header">' +
                            '<button type="button" class="close" aria-hidden="true" tabindex="-1">×</button>' +
                            '<h4>Insert Image</h4>' +
                          '</div>' +
                          '<div class="modal-body">' +
                            '<div class="row-fluid">' +
                              '<div class="note-dropzone span12">Drag an image here</div>' +
                              '<div>or if you prefer...</div>' +
                              '<input class="note-image-input" type="file" class="note-link-url" type="text" />' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="note-link-dialog modal" aria-hidden="false">' +
                      '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                          '<div class="modal-header">' +
                            '<button type="button" class="close" aria-hidden="true" tabindex="-1">×</button>' +
                            '<h4>Edit Link</h4>' +
                          '</div>' +
                          '<div class="modal-body">' +
                            '<div class="row-fluid">' +

                            '<div class="form-group">' +
                              '<label>Text to display</label>' +
                              '<span class="note-link-text form-control input-xlarge uneditable-input" />' +
                            '</div>' +
                            '<div class="form-group">' +
                              '<label>To what URL should this link go?</label>' +
                              '<input class="note-link-url form-control span12" type="text" />' +
                            '</div>' +
                            '</div>' +
                          '</div>' +
                          '<div class="modal-footer">' +
                            '<button href="#" class="btn btn-primary note-link-btn disabled" disabled="disabled">Link</button>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="note-help-dialog modal" aria-hidden="false">' +
                      '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                          '<div class="modal-body">' +
                            '<div class="modal-background">' +
                            '<a class="modal-close pull-right" aria-hidden="true" tabindex="-1">Close</a>' +
                            '<div class="title">Keyboard shortcuts</div>' +
                            sShortcutTable +
                            '<p class="text-center"><a href="//hackerwins.github.io/summernote/" target="_blank">Summernote v0.3</a> · <a href="//github.com/HackerWins/summernote" target="_blank">Project</a> · <a href="//github.com/HackerWins/summernote/issues" target="_blank">Issues</a></p>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>';
                        
    // createTooltip
    var createTooltip = function(welContainer, sPlacement) {
      welContainer.find('button').each(function(i, elBtn) {
        var welBtn = $(elBtn);
        var sShortcut = welBtn.attr(bMac ? 'data-mac-shortcut':'data-shortcut');
        if (sShortcut) { welBtn.attr('title', function(i, v) { return v + ' (' + sShortcut + ')'}); }
      //bootstrap tooltip on btn-group bug: https://github.com/twitter/bootstrap/issues/5687
      }).tooltip({container: 'body', placement: sPlacement || 'top'});
    };
    
    // pallete colors
    var aaColor = [
      ['#000000', '#424242', '#636363', '#9C9C94', '#CEC6CE', '#EFEFEF', '#EFF7F7', '#FFFFFF'],
      ['#FF0000', '#FF9C00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9C00FF', '#FF00FF'],
      ['#F7C6CE', '#FFE7CE', '#FFEFC6', '#D6EFD6', '#CEDEE7', '#CEE7F7', '#D6D6E7', '#E7D6DE'],
      ['#E79C9C', '#FFC69C', '#FFE79C', '#B5D6A5', '#A5C6CE', '#9CC6EF', '#B5A5D6', '#D6A5BD'],
      ['#E76363', '#F7AD6B', '#FFD663', '#94BD7B', '#73A5AD', '#6BADDE', '#8C7BC6', '#C67BA5'],
      ['#CE0000', '#E79439', '#EFC631', '#6BA54A', '#4A7B8C', '#3984C6', '#634AA5', '#A54A7B'],
      ['#9C0000', '#B56308', '#BD9400', '#397B21', '#104A5A', '#085294', '#311873', '#731842'],
      ['#630000', '#7B3900', '#846300', '#295218', '#083139', '#003163', '#21104A', '#4A1031']
    ];
    
    // createPalette
    var createPalette = function(welContainer) {
      welContainer.find('.note-color-palette').each(function() {
        var welPalette = $(this), sEvent = welPalette.attr('data-target-event');
        var sPaletteContents = '';
        for (var row = 0, szRow = aaColor.length; row < szRow; row++) {
          var aColor = aaColor[row];
          var sLine = '<div>';
          for (var col = 0, szCol = aColor.length; col < szCol; col++) {
            var sColor = aColor[col];
            var sButton = ['<button type="button" class="note-color-btn" style="background-color:', sColor,
                           ';" data-event="', sEvent,
                           '" data-value="', sColor,
                           '" title="', sColor,
                           '" data-toggle="button" tabindex="-1"></button>'].join('');
            sLine += sButton;
          }
          sLine += '</div>';
          sPaletteContents += sLine;
        }
        welPalette.html(sPaletteContents);
      });
    };
    
    // createLayout
    var createLayout = this.createLayout = function(welHolder, nHeight, nTabsize, aToolbarSetting) {
      //already created
      if (welHolder.next().hasClass('note-editor')) { return; }
      
      //01. create Editor
      var welEditor = $('<div class="note-editor"></div>');

      //02. statusbar
      if (nHeight > 0) {
        var welStatusbar = $('<div class="note-statusbar"><div class="note-resizebar"><div class="note-icon-bar"></div><div class="note-icon-bar"></div><div class="note-icon-bar"></div></div></div>').prependTo(welEditor);
      }

      //03. create Editable
      var welEditable = $('<div class="note-editable" contentEditable="true"></div>').prependTo(welEditor);
      if (nHeight) { welEditable.height(nHeight); }
      if (nTabsize) {
        welEditable.data('tabsize', nTabsize);
      }

      welEditable.html(dom.html(welHolder));
      welEditable.data('NoteHistory', new History());

      //031. create Codeable
      var welCodeable = $('<textarea class="note-codeable"></textarea>').prependTo(welEditor);

      //032. set styleWithCSS for backColor / foreColor clearing with 'inherit'.
      setTimeout(function() { // protect FF Error: NS_ERROR_FAILURE: Failure
        document.execCommand('styleWithCSS', 0, true);
      });
      
      //04. create Toolbar
      var sToolbar = '';
      for (var idx = 0, sz = aToolbarSetting.length; idx < sz; idx ++) {
        var group = aToolbarSetting[idx];
        sToolbar += '<div class="note-' + group[0] + ' btn-group">';
        for (var i = 0, szGroup = group[1].length; i < szGroup; i++) {
          sToolbar += aToolbarItem[group[1][i]];
        }
        sToolbar += '</div>';
      };

      sToolbar = '<div class="note-toolbar btn-toolbar">' + sToolbar + '</div>';

      var welToolbar = $(sToolbar).prependTo(welEditor);
      createPalette(welToolbar);
      createTooltip(welToolbar, 'bottom');
      
      //05. create Popover
      var welPopover = $(sPopover).prependTo(welEditor);
      createTooltip(welPopover);

      //06. handle(control selection, ...)
      $(sHandle).prependTo(welEditor);
      
      //07. create Dialog
      var welDialog = $(sDialog).prependTo(welEditor);
      welDialog.find('button.close, a.modal-close').click(function(event) {
        $(this).closest('.modal').modal('hide');
      });

      //08. Editor/Holder switch
      welEditor.insertAfter(welHolder);
      welHolder.hide();
    };
    
    // layoutInfoFromHolder
    var layoutInfoFromHolder = this.layoutInfoFromHolder = function(welHolder) {
      var welEditor = welHolder.next();
      if (!welEditor.hasClass('note-editor')) { return; }
      
      return {
        editor: welEditor,
        toolbar: welEditor.find('.note-toolbar'),
        editable: welEditor.find('.note-editable'),
        statusbar: welEditor.find('.note-statusbar'),
        popover: welEditor.find('.note-popover'),
        handle: welEditor.find('.note-handle'),
        dialog: welEditor.find('.note-dialog')
      };
    };
    
    // removeLayout
    var removeLayout = this.removeLayout = function(welHolder) {
      var info = layoutInfoFromHolder(welHolder);
      if (!info) { return; }
      welHolder.html(info.editable.html());
      
      info.editor.remove();
      welHolder.show();
    };
  };

  var renderer = new Renderer();
  var eventHandler = new EventHandler();

  /**
   * extend jquery fn
   */
  $.fn.extend({
    // create Editor Layout and attach Key and Mouse Event
    summernote: function(options) {
      options = $.extend({
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'italic', 'underline', 'clear']],
          ['fontsize', ['fontsize']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['height', ['height']],
          ['table', ['table']],
          ['insert', ['link', 'picture']],
          ['view', ['fullscreen', 'codeview']],
          ['help', ['help']]
        ]
      }, options );

      this.each(function(idx, elHolder) {
        var welHolder = $(elHolder);

        // createLayout with options
        renderer.createLayout(welHolder, options.height, options.tabsize, options.toolbar);

        var info = renderer.layoutInfoFromHolder(welHolder);
        eventHandler.attach(info, options);
      });

      if (this.first() && options.focus) { // focus on first editable element
        var info = renderer.layoutInfoFromHolder(this.first());
        info.editable.focus();
      }
      if (this.length > 0 && options.oninit) { // callback on init
        options.oninit();
      };
    },
    // get the HTML contents of note or set the HTML contents of note.
    code: function(sHTML) {
      //get the HTML contents
      if (sHTML === undefined) {
        var welHolder = this.first();
        if (welHolder.length == 0) { return; }
        var info = renderer.layoutInfoFromHolder(welHolder);
        var bEditable = !!(info && info.editable);
        return  bEditable ? info.editable.html() : welHolder.html();
      }

      // set the HTML contents
      this.each(function(i, elHolder) {
        var info = renderer.layoutInfoFromHolder($(elHolder));
        if (info && info.editable) { info.editable.html(sHTML); }
      });
    },
    // destroy Editor Layout and dettach Key and Mouse Event
    destroy: function() {
      this.each(function(idx, elHolder) {
        var welHolder = $(elHolder);

        var info = renderer.layoutInfoFromHolder(welHolder);
        if (!info || !info.editable) { return; }
        eventHandler.dettach(info);
        renderer.removeLayout(welHolder);
      });
    },
    // inner object for test
    summernoteInner: function() {
      return { dom: dom, list: list, func: func, range: range };
    }
  });
})(window.jQuery); // jQuery

// Array.prototype.reduce fallback
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
if ('function' !== typeof Array.prototype.reduce) {
  Array.prototype.reduce = function(callback, opt_initialValue) {
    'use strict';
    var idx, value, length = this.length >>> 0, isValueSet = false;
    if (1 < arguments.length) { value = opt_initialValue, isValueSet = true; }
    for (idx = 0; length > idx; ++idx) {
      if (this.hasOwnProperty(idx)) {
        if (isValueSet) {
          value = callback(value, this[idx], idx, this);
        } else {
          value = this[idx], isValueSet = true;
        }
      }
    }
    if (!isValueSet) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    return value;
  };
}
