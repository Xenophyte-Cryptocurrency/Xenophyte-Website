
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
				var totalCoinCirculating = parseFloat(blockchainNetworkStatsObject .TotalCoinCirculatingFormatted);
				var totalCoinFee = parseFloat(blockchainNetworkStatsObject .TotalCoinFeeFormatted);

				document.getElementById("CoinMaxSupply").innerHTML = blockchainNetworkStatsObject .TotalSupply + " XENOP";
				document.getElementById("CoinCirculating").innerHTML = blockchainNetworkStatsObject .TotalCoinCirculatingFormatted + " XENOP";
				document.getElementById("CoinTransactionFee").innerHTML = blockchainNetworkStatsObject .TotalCoinFeeFormatted + " XENOP";
				document.getElementById("CoinTotalTransaction").innerHTML =  blockchainNetworkStatsObject .TotalTransactionsConfirmed + "/" +  blockchainNetworkStatsObject .TotalTransactions;
				document.getElementById("CoinBlockchainHeight").innerHTML = blockchainNetworkStatsObject .LastBlockHeight;
				document.getElementById("CoinTotalBlockMined").innerHTML = blockchainNetworkStatsObject .LastBlockHeightUnlocked;
				document.getElementById("CoinCurrentNetworkDifficulty").innerHTML = blockchainNetworkStatsObject .LastBlockDifficulty;
				document.getElementById("CoinCurrentNetworkHashrate").innerHTML = blockchainNetworkStatsObject .NetworkHashrateEstimatedFormatted;


			}
		}
		xmlHttp.open("GET", apiHost + "get_network_stats", true); // async
		xmlHttp.send();
	}
	

	urls = ['https://xenophyte.com/bootstrap.min.js','https://xenophyte.com/vendor/jquery/jquery-3.6.1.min.js'];

	loadScripts(urls, urls.length, function()
	{
		Countdown();
		EnableCountdown();
		GetCoinNetworkInformation();
		setInterval(GetCoinNetworkInformation, 5000);
	});

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


	var countdownInterval;

	function EnableCountdown()
	{
		countdownInterval = setInterval(function()
		{
			Countdown();
		}, 1000);
	}

	function Countdown()
	{
		var countDownDate = 1559340000;
		var now = Math.floor(Date.now() / 1000);

		var distanceNormal = countDownDate - now;
		var distance = distanceNormal * 1000;
  		var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  		var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  		var seconds = Math.floor((distance % (1000 * 60)) / 1000);

			

		if (distanceNormal < 0)
		{
			clearInterval(countdownInterval);
			//document.getElementById("Countdown").innerHTML = "Released";
			//document.getElementById("NetworkPhase").innerHTML = "Main Network";
			//document.getElementById("network").style = "display:none";
		}
		else
		{
  			document.getElementById("Countdown").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
			document.getElementById("NetworkPhase").innerHTML = "Test Phase";
		}
	}

	