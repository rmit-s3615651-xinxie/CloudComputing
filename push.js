function pushToShell(year, month, day) {
	webPreferences:{
		nodeIntegration: true;
	}
	const exec = require("child_process").exec;

	var query = "sh public/libs/getSpecificDayData.sh "+year+" "+month+" "+day;
	window.alert(query);

	const shellScript = exec(query);
	shellScript.stdout.on('data', (data)=>{
		console.log(data);
	});
	shellScript.stderr.on('data', (data)=>{
		console.error(data);
	})
	
	
}

