	function loadScripts(urls, length, success)
	{
		if(length > 0)
		{
        		script = document.createElement("SCRIPT");
        		script.src = urls[length-1];
        		script.onload = function()
			{
				loadScripts(urls, length-1, success);               
			};
			document.getElementsByTagName("head")[0].appendChild(script);
    		}
    		else
        		if(success)
            			success();
		
	}

	var apiHost = "https://api.xenophyte.com/";
	var totalBlockMined = 0;
	var pageBlock = 1;
	var maxBlock = 10;
	var blockMined = [];
	var blockMinedData = [];

	function GetCoinNetworkInformation()
	{
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function()
		{ 
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			{
				var data = JSON.parse(xmlHttp.responseText);
				var dataObject = JSON.parse(data.PacketObjectSerialized);
				var blockchainNetworkStatsObject = dataObject.BlockchainNetworkStatsObject;
				document.getElementById("TotalBlockMinedXenophyte").innerHTML = blockchainNetworkStatsObject.LastBlockHeightUnlocked;
				document.getElementById("NetworkHashrateXenophyte").innerHTML = blockchainNetworkStatsObject.NetworkHashrateEstimated;
				document.getElementById("NetworkDifficultyXenophyte").innerHTML = blockchainNetworkStatsObject.LastBlockDifficulty;
				if (totalBlockMined == 0)
				{
					totalBlockMined = blockchainNetworkStatsObject.LastBlockHeightUnlocked;
					var totalRound = 0;
					for(var i = totalBlockMined; i > 0; i--)
					{
						if (totalRound < maxBlock)
						{
							totalRound++;
							GetCoinBlockPerId(i);
						}
					}
					
				}
				else
				{
					
					if (totalBlockMined < blockchainNetworkStatsObject.LastBlockHeightUnlocked)
					{
						for (var i = totalBlockMined; i <= blockchainNetworkStatsObject.LastBlockHeightUnlocked; i++)
						{
							GetCoinNewBlockPerId(i);
						}
						totalBlockMined = blockchainNetworkStatsObject.LastBlockHeightUnlocked;
					}
				}							
			}
		}
		xmlHttp.open("GET", apiHost + "get_network_stats", true); // async
		xmlHttp.send();
	}
	
	function AskMoreBlock()
	{
		if (blockMined.length < (maxBlock * pageBlock))
		{
			if ((maxBlock * pageBlock) <= totalBlockMined)
			{
				var start = totalBlockMined - (maxBlock * (pageBlock-1));
				var difference = totalBlockMined - (maxBlock * pageBlock);
				for(var i = start ; i > difference; i--)
				{
					if (i > 0)
					{
						GetCoinBlockPerId(i);
					}
				}
			}
			else
			{
				var start = totalBlockMined - blockMined.length;
				if (start > 0)
				{
					for(var i = start; i > 0; i--)
					{
						if (i > 0)
						{
							GetCoinBlockPerId(i);
						}
					}
				}
				else
				{
					pageBlock--;
				}
			}
		}
		else
		{
			pageBlock--;
		}
	}

	function GetCoinBlockPerId(blockId)
	{
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function()
		{ 
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			{
				var data = JSON.parse(xmlHttp.responseText);

				var dataBlockObject = JSON.parse(data.PacketObjectSerialized);
				if (blockMined.indexOf(dataBlockObject.Block.BlockHeight) == -1)
				{
					blockMined.push(dataBlockObject.Block.BlockHeight);
					blockMinedData.push(dataBlockObject.Block);

					var rowBlock = document.createElement('tr');
					rowBlock.setAttribute('data-json', dataBlockObject.Block);
					var rowBlockContent = '<td>' + dataBlockObject.Block.BlockHeight + '</td>' +
							'<td onclick=\"CopyBlockHash(\'' + dataBlockObject.Block.BlockHash +'\')\" class=\"text-primary\"><p>' + dataBlockObject.Block.BlockHash.substring(0,64) + '...</p><div class="alert alert-info" role="alert" id=\'' + dataBlockObject.Block.BlockHash +'\' style=\"display:none\">block hash copied !</div></td>' +
							'<td>' + dataBlockObject.Block.BlockDifficulty + '</td>' +
							'<td>' + formatDate(dataBlockObject.Block.TimestampCreate) + '</td>' +
							'<td>' + formatDate(dataBlockObject.Block.TimestampFound) + '</td>';
						rowBlock.innerHTML = rowBlockContent;
					
					var blockList = $('#XenophyteListBlockMinedRows');
					blockList.append(rowBlock);
					previousSorting = "asc";
					sortTable(0);
				}
			}
		}
		xmlHttp.open("GET", apiHost + "get_block_from_height/" + blockId, true); // async
		xmlHttp.send();
	}

	function CopyBlockHash(blockHash)
	{
		var el = document.createElement('textarea');
   		el.value = blockHash;
		el.setAttribute('readonly', '');
   		el.style = {position: 'absolute', left: '-9999px'};
		document.body.appendChild(el);
   		el.select();
   		document.execCommand('copy');
		document.body.removeChild(el);
		document.getElementById(blockHash).style="display:visible";
		GetCoinBlockPerHash(blockHash);
		setTimeout(function()
		{
			document.getElementById(blockHash).style="display:none";
		}, 500);
	}

	function GetCoinBlockPerHash(blockHash)
	{
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function()
		{ 
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			{
				var data = JSON.parse(xmlHttp.responseText);

				var dataBlockObject = JSON.parse(data.PacketObjectSerialized);

				document.getElementById("blockHeight").innerHTML = dataBlockObject.Block.BlockHeight;
				document.getElementById("blockHash").innerHTML = dataBlockObject.Block.BlockHash;
				document.getElementById("blockDifficulty").innerHTML = dataBlockObject.Block.BlockDifficulty;
				document.getElementById("blockDateCreated").innerHTML = formatDate(dataBlockObject.Block.TimestampCreate);
				document.getElementById("blockDateFound").innerHTML = formatDate(dataBlockObject.Block.TimestampFound);

				document.getElementById("XenophyteBlockResearchResult").style="display:visible";
				document.getElementById("blockQRCode").innerHTML = "";
				jQuery(function()
				{
						jQuery('#blockQRCode').qrcode(dataBlockObject.Block.BlockHash);
				});
        			$('html, body').animate({ scrollTop: $('#XenophyteBlockResearchResult').offset().top }, 'slow');
			}
		}
		xmlHttp.open("GET", apiHost + "get_block_from_hash/" + blockHash, true); // async
		xmlHttp.send();
	}

	function GetCoinNewBlockPerId(blockId)
	{
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function()
		{ 
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			{
				var data = JSON.parse(xmlHttp.responseText);

				var dataBlockObject = JSON.parse(data.PacketObjectSerialized);
				if (blockMined.indexOf(dataBlockObject.Block.BlockHeight) == -1)
				{
					blockMined.push(dataBlockObject.Block.BlockHeight);
					blockMinedData.push(dataBlockObject.Block);

					var rowBlock = document.createElement('tr');
					rowBlock.setAttribute('data-json', dataBlockObject.Block);
					var rowBlockContent = '<td>' + dataBlockObject.Block.BlockHeight + '</td>' +
							'<td onclick=\"CopyBlockHash(\'' + dataBlockObject.Block.BlockHash +'\')\" class=\"text-primary\"><p>' + dataBlockObject.Block.BlockHash.substring(0,64) + '...</p><div class="alert alert-info" role="alert" id=\'' + dataBlockObject.Block.BlockHash +'\' style=\"display:none\">block hash copied !</div></td>' +
							'<td>' + dataBlockObject.Block.BlockDifficulty + '</td>' +
							'<td>' + formatDate(dataBlockObject.Block.TimestampCreate) + '</td>' +
							'<td>' + formatDate(dataBlockObject.Block.TimestampFound) + '</td>';
						rowBlock.innerHTML = rowBlockContent;
					
					var blockList = $('#XenophyteListBlockMinedRows');
					blockList.append(rowBlock);
					previousSorting = "asc";
					sortTable(0);
				}
			}
		}
		xmlHttp.open("GET", apiHost + "get_block_from_height/" + blockId, true); // async
		xmlHttp.send();
	}

	// THankis MSFT Copilot ;)
	// >

	// coderCamp....org

	const hexCharactersLow = [0, 1, 2, 3, 4, 5, 6, 7];
	const hexCharactersHi = [8, 9, "A", "B", "C", "D", "E", "F"];
	
	function generateNColorS(n) {

		var colors = [];

		var flipFlop = false;
		for (let iC = 0; iC < n; iC++) {

			let hexColorRep = "";
			
			for (let index = 0; index < 6; index++) {

				if (index % 2 == 0) {
					flipFlop = !flipFlop; //Math.round(Math.random()) == 0 ? false : true;
				}

				const randomPosition = Math.floor(Math.random() * 8);

				hexColorRep += flipFlop ? hexCharactersHi[randomPosition] : hexCharactersLow[randomPosition];

			}

			hexColorRep += Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
				//Math.floor(Math.random() * 128 + (flipFlop ? 0 : 128)).toString(16).padStart(2, '0');

			colors.push(hexColorRep);
		}
		return colors;
	}
	
	function groupBy(array, keysToGroup, keysToSum) {
		const groupedData = {};

		// Agrupar y sumar
		array.forEach((item) => {
			const groupKey = keysToGroup.map((key) => item[key]).join('|');
			if (!groupedData[groupKey]) {
				groupedData[groupKey] = { ...item };
				keysToSum.forEach((key) => {
					groupedData[groupKey][key] = parseFloat(item[key]);
				});
			} else {
				keysToSum.forEach((key) => {
					groupedData[groupKey][key] += parseFloat(item[key]);
				});
			}
		});

		// Aplanar los datos agrupados en un array
		const flattenedArray = Object.keys(groupedData).map((groupKey) => {
			return {
				...groupedData[groupKey],
				groupKey: groupKey.split('|').reduce((obj, key, index) => {
					obj[keysToGroup[index]] = key;
					return obj;
				}, {})
			};
		});

		return flattenedArray;
	}
	
	function distinct(items, mapper) {
		if (!mapper) mapper = (item) => item;
		return items.map(mapper).reduce((acc, item) => {
			if (acc.indexOf(item) === -1) acc.push(item);
			return acc;
		}, []);
	}

	function hexStringToArray(hexString) {
		var array = [];
		for (var i = 0; i < hexString.length; i += 2) {
			array.push(parseInt(hexString.substring(i, i + 2), 16));
		}
		return array;
	}

	function arrayToBase64(arrayDeEnteros) {
		const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		let base64 = '';
		let i;

		for (i = 0; i < arrayDeEnteros.length - 2; i += 3) {
			base64 += base64Chars[arrayDeEnteros[i] >> 2];
			base64 += base64Chars[((arrayDeEnteros[i] & 3) << 4) | (arrayDeEnteros[i + 1] >> 4)];
			base64 += base64Chars[((arrayDeEnteros[i + 1] & 15) << 2) | (arrayDeEnteros[i + 2] >> 6)];
			base64 += base64Chars[arrayDeEnteros[i + 2] & 63];
		}

		// Padding
		if (i < arrayDeEnteros.length) {
			base64 += base64Chars[arrayDeEnteros[i] >> 2];
			if (i === arrayDeEnteros.length - 2) {
				base64 += base64Chars[((arrayDeEnteros[i] & 3) << 4) | (arrayDeEnteros[i + 1] >> 4)];
				base64 += base64Chars[(arrayDeEnteros[i + 1] & 15) << 2];
				base64 += '=';
			} else {
				base64 += base64Chars[(arrayDeEnteros[i] & 3) << 4];
				base64 += '==';
			}
		}

		return base64;
	}

	// END XENOP_charts .-~^

//-------------------------------------------------------------------------------------//
// Other functions

	function formatHashrate(input)
	{
		var result = parseFloat(input);
		if (result < 1000)
		{
			return toFixedTrunc(parseFloat(result), 2) + " H/s";
		}
		else
		{
			if (result >= 1000 && result < 1000000) // KH
			{
				var result = (result/1000);
				return toFixedTrunc(parseFloat(result), 2) + " KH/s";
			}
			if (result >= 1000000 && result < 1000000000) // MH
			{
				var result = (result/1000000);
				return toFixedTrunc(parseFloat(result), 2) + " MH/s";
			}
			if (result >= 1000000000 && result < 1000000000000) // GH
			{
				var result = (result/1000000000);
				return toFixedTrunc(parseFloat(result), 2) + " GH/s";
			}
			if (result >= 1000000000000 && result < 1000000000000000) // TH
			{
				var result = (result/1000000000);
				return toFixedTrunc(parseFloat(result), 2) + " TH/s";
			}
			if (result >= 1000000000000000)
			{
				var result = (result/1000000000);
				return toFixedTrunc(parseFloat(result), 2) + " PH/s";
			}
		}
	}

	function toFixedTrunc(value, n)
	{
		const v = value.toString().split('.');
		if (n <= 0) 
			return v[0];

		let f = v[1] || '';

		if (f.length > n)
			return `${v[0]}.${f.substr(0,n)}`;

		while (f.length < n)
			f += '0';

  		return `${v[0]}.${f}`
	}

	function formatDateTime(input){
		var t = new Date(1970,0,1);
		t.setSeconds(input);
		var s = t.toTimeString().substr(0,8);
		if(input > 86399)
		{
			s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
		}
		return s;
	};

	function formatDate(time){
		if (!time) return '';
		return new Date(parseInt(time) * 1000).toLocaleString();
	}

	function GetTimeExpire()
	{
	 	var now = new Date();
  		var time = now.getTime();
  		var expireTime = time + 1000*60*5;
  		now.setTime(expireTime);
		return now;
	}

	function CheckBlockFeeUpdate(dateBlock) 
	{
		if (dateBlock >= 1565379210) // Implement block fee 
		{
			return true;
		}
		return false;
	}


	var previousSorting = "desc";

	function sortTable(n) {
		var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
		table = document.getElementById("blockTable");
		switching = true;
		if (previousSorting == "asc")
		{
			dir = "desc"; 
			previousSorting = "desc";
		}
		else
		{
			dir = "asc";
			previousSorting = "asc";
		}
		while (switching) {
			switching = false;
			rows = table.rows;
		
			for (i = 1; i < (rows.length - 1); i++) {
			shouldSwitch = false;
		
			x = rows[i].getElementsByTagName("TD")[n];
			y = rows[i + 1].getElementsByTagName("TD")[n];
		
			if (dir == "asc") {
				if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
				shouldSwitch = true;
				break;
				}
			} else if (dir == "desc") {
				if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
				shouldSwitch = true;
				break;
				}
			}
			}
			if (shouldSwitch) {
			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
			switching = true;
			switchcount ++; 
			} else {
			if (switchcount == 0 && dir == "asc") {
				dir = "desc";
				switching = true;
			}
			}
		}
	}

	function CalculateMiningTimeFromBlocktemplate(hashrate)
	{
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function()
		{ 
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			{
				var data= JSON.parse(xmlHttp.responseText);
				var calculation = ((data.block_difficulty / (hashrate / data.block_lifetime)) / 3600) / 24;
				calculation = toFixedTrunc(calculation, 4);
				document.getElementById("calculationResult").innerHTML = calculation + " day(s)";
			}
		}
		xmlHttp.open("GET", apiHost + "get_last_blocktemplate", true); // async
		xmlHttp.send();
	}

	function CalculateMiningTime(hashrate, input)
	{
		if (hashrate <= 0)
		{
			input = false;
		}
		var unit = document.getElementById("XenophyteCalculation").value;
		if (input)
		{
			if (unit == "h")
			{
				hashrate = hashrate;
			}
			else if (unit == "kh")
			{
				hashrate = hashrate * 1000;
			}
			else if (unit == "mh")
			{
				hashrate = hashrate * 1000000;
			}
		
			CalculateMiningTimeFromBlocktemplate(hashrate);
		}
	}

	urls = ['https://xenophyte.com/bootstrap.min.js', 'https://xenophyte.com/jquery.qrcode.min.js', 'https://xenophyte.com/vendor/jquery/jquery-3.6.1.min.js'];

	loadScripts(urls, urls.length, function()
	{
 
		document.getElementById("XenophyteBlockResearchResult").style = "display:none";


		$("#showXenophyteMoreBlock").click(function()
		{
			pageBlock++;
			AskMoreBlock();
		});

		$("#searchXenophyteBlockPerHash").click(function()
		{
			var blockHash = $("#blockHashSearched").val().trim();
			if (!blockHash)
			{
				$("blockHashSearched").focus();
			}
			else
			{
				GetCoinBlockPerHash(blockHash);
			}
		});

		$("#blockHashSearched").keyup(function(e)
		{
			if (e.keyCode === 13)
				$("#searchXenophyteBlockPerHash").click();
		});

		if(window.location.href.indexOf("#") != -1)
		{
			GetCoinBlockPerHash(window.location.href.split('#')[1]);
		}


		$("#inputHashrateCalculator").keyup(function(e)
		{
			if (e.keyCode === 13)
				$("#buttonCalculateProfit").click();
		});


		$("#buttonCalculateProfit").click(function()
		{
			var hashrate = $("#inputHashrateCalculator").val().trim();
			if (!hashrate)
			{
				$("inputHashrateCalculator").focus();
			}

			CalculateMiningTime(hashrate, true);
		});
		GetCoinNetworkInformation();

		setInterval(GetCoinNetworkInformation, 5000);
		
	});
