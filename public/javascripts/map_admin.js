var floorMap = {
	overlay: function (originOffset, x1, y1, x2, y2, assignedId) {
		id = 'overlay' + $('.overlay').length,
		x1 = x1 || 0,
		y1 = y1 || 0,
		x2 = x2 || x1,
		y2 = y2 || y1,
		assignedId = assignedId || null;

		var newOverlay = '<div id="overlay' + $('.overlay').length + '" class="overlay"' 
			+ ' style="z-index: ' + $('.overlay').length + ';' 
			+ ' left: ' + (x1 + originOffset.left) + 'px;'
			+ ' top: ' + (y1 + originOffset.top) + 'px;';
		
		if (x2 != x1 || y2 != y1) {
			newOverlay += ' width: ' + (x2 - x1) + 'px;' + ' height: ' + (y2 - y1) + 'px;'
		} else {
			newOverlay += ' right: ' + ($(window).width() - (x1 + originOffset.left)) + 'px;'
				+ ' bottom: ' + ($(window).height() - (y1 + originOffset.top)) + 'px;';
		}
	
		newOverlay += '"></div>';
		newOverlay = $(newOverlay).data({
			'assignedId': assignedId 
		}).bt({
			trigger: 'click',
			contentSelector: 'floorMap.contentSelector',
			fill: '#FFF',
			strokeWidth: 3, 
			cssClass: 'tooltip',
			closeWhenOthersOpen: true,
			preBuild: function() {
				floorMap.buildTooltipOptions(this);
			},
			preHide: function() {
				if ($('.bt-content').html()) {
					$('#tooltip').html($('.bt-content').html());
				}
			}
		});
		
		return newOverlay;
	},

	contentSelector: function() { 
		var html = $('#tooltip').html(); 
		$('#tooltip').empty();
		return html;
	}, 

	buildTooltipOptions: function(activeOverlay) {
		activeOverlay = activeOverlay || '.overlay.bt-active';
		var newOptions = '';
		$.each(floorMap.assets, function(index, asset) {
			if (asset.x1 && $(activeOverlay).data('assignedId') == asset.id) {
				newOptions += '<option selected="selected" value="' + asset.id + '">' 
					+ asset.name + '</option>';
			} else if (!asset.x1) {
				newOptions += '<option value="' + asset.id + '">' 
					+ asset.name + '</option>';
			}
		});
		$('#overlayId').html(newOptions);
		if (newOptions == '') {
			$('#overlayId').attr('disabled', true);
		} else {
			$('#overlayId').removeAttr('disabled');
		}
	},

	/* This is so goddamned ugly */
	syncOverlaysToAssets: function() {
		$.each(floorMap.assets, function(i, asset) {
			floorMap.assets[i].x1 = null;
			floorMap.assets[i].y1 = null;
			floorMap.assets[i].x2 = null;
			floorMap.assets[i].y2 = null;
			$('.overlay').each(function(j, overlay) {
				if ($(overlay).data('assignedId') == asset.id) {
					var mapOffset = $('#map').offset(), overlay = $(overlay);
					floorMap.assets[i].x1 = overlay.offset().left - mapOffset.left;
					floorMap.assets[i].y1 = overlay.offset().top - mapOffset.top;
					floorMap.assets[i].x2 = 
						overlay.offset().left + overlay.innerWidth() - mapOffset.left;
					floorMap.assets[i].y2 = 
						overlay.offset().top + overlay.innerHeight() - mapOffset.top;
				}
			});
		});
	},

	addNudgeHandler: function(button, attr, delta) {
		$(button).live('click', function() {
			$('.overlay.bt-active').css(attr, function(index, value) {
				return parseInt(value) + delta;
			});
		});
	}
};

$(function() {
	$.ajax({
		type: 'GET',
		url: window.location.href + '/assets',
		dataType: 'json',
		error: function(){},
		success: function(data) {
			floorMap.assets = data;
			$.each(floorMap.assets, function(index, asset) {
				if (asset.x1 && asset.y1 && asset.x2 && asset.y2) {
					$('#content-right').append(
						new floorMap.overlay(
							$('#map').offset(),
							asset.x1, 
							asset.y1, 
							asset.x2, 
							asset.y2,
							asset.id
						)
					);
				}
			});
		}
	});

	$.each(
		[
			['#moveUp', 'top', -1],
			['#moveRight', 'left', 1],
			['#moveDown', 'top', 1],
			['#moveLeft', 'left', -1],
			['#widen', 'width', 1],
			['#narrow', 'width', -1],
			['#heighten', 'height', 1],
			['#shorten', 'height', -1]
		],
		function(index, value) {
			floorMap.addNudgeHandler(value[0], value[1], value[2]);
		}
	);

	$('#closeTooltip').live('click', function() {
		$('.overlay').btOff();
	});

	$('#removeOverlay').live('click', function() {
		/* Ajax stuff */
		if ($('.overlay.bt-active').data('assignedId')) {
			$.ajax({
				url: '/reservable_assets/' + $('.overlay.bt-active').data('assignedId') + '/edit',
				success: function(data) {
					var mapOffset = $('#map').offset(), overlay = $('.overlay.bt-active');
					$('.bt-content').append(data);
					$('#reservable_asset_x1').val('');
					$('#reservable_asset_y1').val('');
					$('#reservable_asset_x2').val('');
					$('#reservable_asset_y2').val('');
					$('#edit_reservable_asset_' + $('.overlay.bt-active').data('assignedId')).submit();
					$('.overlay.bt-active').btOff().remove();
					$('#loading').hide();
					$('#tooltipTools').show();
				}
			});
		}
		floorMap.syncOverlaysToAssets();
	});

	$('#applyOverlay').live('click', function() {
		$('.overlay.bt-active').data({ assignedId: $('#overlayId').val() });
		floorMap.syncOverlaysToAssets();
		$('#tooltipTools').hide();
		$('#loading').show();

		$.ajax({
			url: '/reservable_assets/' + $('.overlay.bt-active').data('assignedId') + '/edit',
			success: function(data) {
				var mapOffset = $('#map').offset(), overlay = $('.overlay.bt-active');
				$('.bt-content').append(data);
				$('#reservable_asset_x1').val(overlay.offset().left - mapOffset.left);
				$('#reservable_asset_y1').val(overlay.offset().top - mapOffset.top);
				$('#reservable_asset_x2').val(overlay.offset().left + overlay.width() - mapOffset.left);
				$('#reservable_asset_y2').val(overlay.offset().top + overlay.height() - mapOffset.top);
				$('#edit_reservable_asset_' + $('.overlay.bt-active').data('assignedId')).submit();
				$('.overlay').btOff();
				$('#loading').hide();
				$('#tooltipTools').show();
			}

		});

		//$('.overlay').btOff();
	});

	$(window).resize(function() {
	});

	$('.overlay').live({
		drag: function(event) {
			$(this).css({
				top: event.pageY - $(this).data('diffY'),
				left: event.pageX - $(this).data('diffX')
			});
		},
		draginit: function(event) {
			$(this).data({
				diffX: event.pageX - $(this).offset().left,
				diffY: event.pageY - $(this).offset().top
			});
		},
		mouseup: function() {
			$(this).add('#map').unbind('mousemove');
		},
		dblclick: function(event) {
			$('#content-right').append(new floorMap.overlay(
				$(event.target).offset(),
				parseInt($(event.target).width() * 0.25),
				parseInt($(event.target).height() * 0.25),
				parseInt($(event.target).width() * 1.25),
				parseInt($(event.target).height() * 1.25)
			));
		}
	});

	$('#map').mousedown(function(event) {
		if (event.target == this) {
			event.preventDefault();
			var newOverlay = new floorMap.overlay(
				{left: 0, top: 0},
				event.pageX,
				event.pageY
			),
			startX		= event.pageX,
			startY		= event.pageY;

			$('#content-right').append( $(newOverlay) );

			$(this).add(newOverlay).mousemove(function(event) { 
				if (event.pageY > startY)
					$(newOverlay).css('bottom', $(window).height() - event.pageY);
				else
					$(newOverlay).css('top', event.pageY);
				if (event.pageX > startX)
					$(newOverlay).css('right', $(window).width() - event.pageX);
				else
					$(newOverlay).css('left', event.pageX);
			}).one('mouseup', function() {
				$(newOverlay).css({
					width: parseInt($(newOverlay).innerWidth()) + 'px',
					height: parseInt($(newOverlay).innerHeight()) + 'px',
					right: 'auto',
					bottom: 'auto'
				});
			});
		}
	}).mouseup(function() {
		$('#map, .overlay').unbind('mousemove');
	});
});
