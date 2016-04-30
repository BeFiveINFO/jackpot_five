/*
	VFX
*/
Gframe.rom.vfx = [];

Gframe.rom.vfx = [
	{
		'id': 'coins_smallWin',
		'container_class': 'coin-container',
		'template': '<div class="coin spin"><div class="tail"></div><div class="head"></div></div>',
		'elements': [
			'type-a late', // normal
			'type-b ',
			'type-c later',
			'type-d ',
			'type-e latest',
			'type-f ',
			'type-a-reverse late', // reverse
			'type-b-reverse left',
			'type-c-reverse far-left',
			'type-d-reverse ',
			'type-e-reverse right',
			'type-f-reverse far-right',
		]
	},
	{
		'id': 'coins_bigWin',
		'container_class': 'coin-container',
		'template': '<div class="coin spin"><div class="tail"></div><div class="head"></div></div>',
		'elements': [
			'type-a right', // normal
			'type-b late',
			'type-c latest left',
			'type-d late',
			'type-e right',
			'type-f late',
			'type-a-reverse late', // reverse
			'type-b-reverse ',
			'type-c-reverse late',
			'type-d-reverse latest',
			'type-e-reverse late',
			'type-f-reverse ',
			'type-a late far-right', // normal
			'type-b late left',
			'type-c later right',
			'type-d late far-left',
			'type-e latest far-right',
			'type-f later right',
			'type-a-reverse late', // reverse
			'type-b-reverse later left',
			'type-c-reverse later far-left',
			'type-d-reverse latest right',
			'type-e-reverse latest right',
			'type-f-reverse late far-right',
			'type-a way-much-later far-right', // normal
			'type-b much-later left',
			'type-c much-later right',
			'type-d way-much-later far-left',
			'type-e way-much-later far-right',
			'type-f way-much-later right',
			'type-a-reverse much-later', // reverse
			'type-b-reverse much-later left',
			'type-c-reverse much-later far-right',
			'type-d-reverse way-much-later left',
			'type-e-reverse much-later left',
			'type-f-reverse way-much-later far-left',
		]
	}
];
