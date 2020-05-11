
var router = express.Router();
var exec = require('child_process').exec;
var $ = require('jquery');
var query;

router.get('/', function (req, res, next) {
	
	exec(query, function (err, stdout, stderr) {
		console.log(stdout.toString('utf'));
	})
	res.send("done");
	
})

module.exports = router;



function pushToShell(year, month, day) {
	
	query = "sh public/libs/getSpecificDayData.sh "+year+" "+month+" "+day;
//	window.alert(query);
//
//	const shellScript = exec(query);
//	shellScript.stdout.on('data', (data)=>{
//		console.log(data);
//	});
//	shellScript.stderr.on('data', (data)=>{
//		console.error(data);
//	})
	
	
}

