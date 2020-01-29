// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var remote = require('electron').remote;
var $ = require('jQuery');
var jQuery = $;
require('shelljs/global');
//require('jquery-ui');
//require('shelljs/global');
const {shell} = require('electron');
var appRootDir = require('app-root-dir').get();
var ffmpegpath = appRootDir + '/node_modules/ffmpeg/ffmpeg';
var ffprobepath = appRootDir + '/node_modules/ffmpeg/ffprobe';
var magickpath = appRootDir + '/node_modules/imagemagick/magick';
var appswitchpath = appRootDir + '/node_modules/imagemagick/appswitch';
var filelist = [];
var widtharr = [];
var heightarr = [];
var croppixelarr = [];
var canvasaspect;
var osTmpdir=require('os-tmpdir');
var temp=osTmpdir();
var workdir = temp + '/' + maketemp();
remote.getGlobal('workdirObj').prop1=workdir;
console.log(workdir);

var previewfile = workdir + '\\preview.png';
String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}
previewfile=previewfile.replaceAll('c:\\','/');
previewfile=previewfile.replaceAll('\\','/');
var addfiledelay=0;
var previewindex = 0;
var lastperc = 0;
var lastpercUL = 0;
var fs = require('fs');
var path = require('path');
var croppedfilelist=[];
var title,folder,finallink;
window.croppixelperc = 0.09;
const spawn = require('child_process').spawn;
const spawnsync = require('child_process').spawnSync;
const Store = require('electron-store');
const store = new Store();
//store.set('unicorn', '🦄');
//console.log(store.get('unicorn'));
/*
var namepath =  appRootDir + '\\name.bat';
var thisclippath='C:\\Users\\\Ben\\Desktop\\Janus 2\\98765432_Janus_20140127_124547_0009.mp4';
ffprobe = spawn('cmd.exe', ['/c', '"'+ffmpegpath+'"', thisclippath], { windowsVerbatimArguments: true });
ffprobe.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});
ffprobe.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});
*/

//ffprobeOb = JSON.parse(ffprobe.stdout);
//console.log(ffprobe.stdout.toString());

//fs.createReadStream("c:/Users/Ben/Desktop/Janus/98765432_Janus_20140127_124547_0001 - Copy.jpg").pipe(fs.createWriteStream(temp + '\\1.jpg'));
//THIS IS IT.  NEED TO COPY ALL FILES TO TEMP DIRECTORY, THEN CREATE PREVIEWS

/*
var outfile = 'c:\Users\Ben\Desktop\2.mp4';
var file = 'c:\Users\Ben\Desktop\1.mp4';
var croppixel =50;
var cropvftext = 'setsar=1,scale=trunc(iw/2)*2:trunc(ih/2)*2,crop=in_w:in_h-' + croppixel + ':0:' + croppixel + ',scale=300:-1';
ffprobe = spawnsync('cmd.exe', ['/c', ffmpegpath,'-i', file, '-vf', cropvftext, '-pix_fmt', 'rgb24', '-vframes', '1', '-f', 'image2', '-y', outfile]);

//ffprobe = spawnsync('cmd.exe', ['/c', ffmpegpath, 'i']);
  //ffprobeOb = JSON.parse(ffprobe.stdout);
  console.log(ffprobe.stderr.toString());

ffprobe.stdout.on('data', (data) => {
  //console.log(`stdout: ${data}`);
  ffprobeOb = JSON.parse(`${data}`);
  console.log(ffprobeOb.streams[0].width);
});
ffprobe.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ffprobe.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
//ffprobeOb = JSON.parse(ffprobe.stdout);
//console.log(ffprobeOb.streams[0].width);
*/

function maketemp() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 10; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

function run_cmd(cmd, args, callBack) {
	var spawn = require('child_process').spawn;
	var child = spawn(cmd, args);
	var resp = "";
	child.stdout.on('data', function(buffer) {
		resp += buffer.toString()
	});
	child.stdout.on('end', function() {
		callBack(resp)
	});
} // ()
function isclip(filename) {
	var clipext = ['mp4', 'm4v', 'avi', 'wmv', 'mov', 'flv', 'mpg', 'mpeg'];
	for (var i = 0; i < clipext.length; i++) {
		if (filename.toLowerCase().split('.').pop().indexOf(clipext[i]) >= 0) {
			return (1);
		}
	}
	return (0);
}

function isstill(filename) {
	var stillext = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif'];
	for (var i = 0; i < stillext.length; i++) {
		if (filename.toLowerCase().split('.').pop().indexOf(stillext[i]) >= 0) {
			return (1);
		}
	}
	return (0);
}

function search(startPath) {
	var path = require('path');
	var list = [];
	if (!fs.existsSync(startPath)) {
		return;
	}
	var files = fs.readdirSync(startPath);
	for (var i = 0; i < files.length; i++) {
		var filename = path.join(startPath, files[i]);
		var stat = fs.lstatSync(filename);
		if (stat.isDirectory()) {
			var list_temp = [];
			list_temp = search(filename); //recurse
			for (var m = 0; m < list_temp.length; m++) {
				list.push(list_temp[m]);
			}
		} else if (isstill(filename) || isclip(filename)) {
			list.push(filename);
		} else {
			$('#croplist').append(filename + ' was ignored because it was not an image file'+'<br>');
			console.log(filename);
		}
	}
	return (list);
}

function addtofilelist(toappend){
	//console.log(addfiledelay)
	setTimeout(function() {
				$('#filelist').append(toappend);
				$('#filelist').animate({scrollTop: $('#filelist').prop("scrollHeight")}, 10);
        }, addfiledelay);
	addfiledelay+=50;
}
//allow drop on dahsed area
$("#filelistwrap").on('dragenter', function(event) {
	event.stopPropagation();
	event.preventDefault();
});
$("#filelistwrap").on('dragover', function(event) {
	event.stopPropagation();
	event.preventDefault();
});
$("#filelistwrap").on('drop', function(event) {
	event.preventDefault();
	//var focus = spawn('cmd.exe', ['/c', 'call', '"'+sendkeysbatpath+'"', '"Clip Deidentifier"', '""'],{windowsVerbatimArguments: true});
	var focus = spawn(appswitchpath, ['-a', 'Clip Deidentifier']);
	focus.stdout.on('data', (data) => {
		console.log(`stdout: ${data}`);
	});
	focus.stderr.on('data', (data) => {
		console.log(`stderr: ${data}`);
	});
	var path = require('path');
	var files = event.originalEvent.dataTransfer.files;
	for (var i = 0; i < files.length; i++) {
		name = files[i].name;
		path = files[i].path;
		if (fs.lstatSync(path).isDirectory()) {
			var temp_list = [];
			temp_list = search(path);
			for (var k = 0; k < temp_list.length; k++) {
				if (filelist.indexOf(temp_list[k]) == -1) {
					filelist.push(temp_list[k]);
					index = filelist.length;
					//$('#filelist').append(index + ': ' + temp_list[k] + '<br />');
					addtofilelist(index + ': ' + temp_list[k] + '<br />');
				}
			}
		} else if (isstill(name) || isclip(name)) {
			if (filelist.indexOf(path) == -1) {
				filelist.push(path);
				index = filelist.length;
				//$('#filelist').append(index + ': ' + path + '<br />');
				addtofilelist(index + ': ' + path + '<br />');
			}
		} else {
			//var filename = filepaths[i].replace(/^.*[\\\/]/, '');
			$('#croplist').append(name+' was ignored because it was not an image file'+'<br>');
			console.log(name);
		}
	}
	addfiledelay=0;
	addfilestatus();
	$('#previewbtn').fadeIn();
	$('#clearbtn').fadeIn();
	$('#drag').css('visibility','hidden');
});
$('#clearbtn').click(function() {
	filelist = [];
	$('#filelist').html('');
	$('#previewbtn').fadeOut();
	$(this).hide();
	$('#drag').css('visibility','visible');
	addfilestatus();
});
//prevent ‘drop’ event on document.
$(document).on('dragenter', function(e) {
	e.stopPropagation();
	e.preventDefault();
});
$(document).on('dragover', function(e) {
	e.stopPropagation();
	e.preventDefault();
});
$(document).on('drop', function(e) {
	e.stopPropagation();
	e.preventDefault();
});
/*
function deidentify(filelist, croppixels) {
	var temp = maketemp();
	outfile = '/tmp/' + temp + '.mp4';
	console.log("saving to: " + outfile);
	ffmpeg = spawn('cmd.exe', ['/c', ffmpegpath, '-i', clips[0], '-an', '-q:v', '1', '-vcodec', 'libx264', '-y', '-pix_fmt', 'yuv420p', '-vf', 'setsar=1,scale=trunc(iw/2)*2:trunc(ih/2)*2,crop=in_w:in_h-50:0:50', outfile]);
	if (ffmpeg.status.toString() == 0) {
		console.log('successful transcoding for: ' + clips[0]);
		folder = 'daaskjh876';
		localfile = 'file=@' + outfile;
		uploadlink = 'https://www.ultrasoundoftheweek.com/cspublic/curlupload.php?&f=' + folder;
		curlsend = spawn('cmd.exe', ['/c', curlpath, '-i', '-F', localfile, uploadlink]);
		if (curlsend.status.toString() == 0) {
			console.log('sucessful upload for: ' + outfile);
		} else {
			console.log("curl ERROR: " + curlsend.stderr.toString());
		}
	} else {
		console.log("ffmpeg ERROR: " + ffmpeg.output.toString());
	}
}  //for first curl use curl -b cookie.txt, then use curl -b cookie.txt to avoid re-authentication and set session var
*/
function canvasbg(filelist) {

			//console.log(filelist[i]);
			//ffmpeg = spawnsync('cmd.exe', ['/c',  ffmpegpath,'-i', filelist[0], '-vf', 'scale=500:-1', '-pix_fmt', 'rgb24', '-vframes', '1', '-f', 'image2', '-y', previewfile]);
			ffmpeg = spawnsync(ffmpegpath, ['-i', filelist[0], '-an', '-vf', 'scale=500:-1', '-pix_fmt', 'rgb24', '-vframes', '1', '-f', 'image2', '-y', previewfile]);
			//console.log(ffmpeg.stdout.toString());
			ffprobe = spawnsync(ffprobepath, ['-print_format', 'json', '-show_streams', '-i', filelist[0]]);
			//ffprobe = spawnsync('cmd.exe', ['/c', ffprobepath, '-print_format', 'json', '-show_streams', filelist[0]]);
			ffprobeOb = JSON.parse(ffprobe.stdout);
			return (ffprobeOb);

}
$('#previewbtn').click(function() { //Generate page of 9% cropped thumbnails to preview
	if (!fs.existsSync(workdir)) {
		fs.mkdirSync(workdir);
	}
	$('#clearbtn').hide();
        $('#filelistwrap').hide();
		$('#addfilestatus').hide();
        $('#previewbtn').hide();
	$('#cropbtn').hide();
	$('#confirm').hide();
	$('#loading-container').show();
	setTimeout(function() {
		//spawnsync('cmd.exe', ['/c','DEL','/s', '/q', workdir]); //CLEAR
                preview();
        }, 10);
});
function showbtns(){
   	return () => new Promise((resolve, reject) => {
		$('#home').fadeIn();
        	$('#cropbtn').fadeIn();
        	$('#manualbtn').fadeIn();
			$('#confirm').fadeIn();
		resolve();
        });
}

function queue(tasks) {
	let index = 0;
	const runTask = (arg) => {
		if (index >= tasks.length) {
			return Promise.resolve(arg);
		}
		return new Promise((resolve, reject) => {
			tasks[index++](arg).then(arg => resolve(runTask(arg))).catch(reject);
		});
	}
	return runTask();
}

function customSpawn(command, args) {
	return () => new Promise((resolve, reject) => {
		const child = spawn(command, args, {windowsVerbatimArguments: true});
		child.stderr.on('data', (data) => {
  			console.log(command+args+`stderr: ${data}`);
		});
		child.stdout.on('data', (data) => {
                        console.log(`stdout: ${data}`);
                });

		child.on('close', code => {
			if (code === 0) {
				resolve();
			} else {
				reject();
			}
		});
	});
}
function updatetn(i){
	return () => new Promise((resolve, reject) => {
		var thisindex=i+1;
		var outfile = workdir + '/' + thisindex + '.' + previewindex + '.png';
                //widthcrop = 300;
                //heightcrop = Math.round((heightarr[i - 1] - croppixelarr[i - 1]) * 300 / widtharr[i - 1]);
        var imagehtml = '<img src="' + outfile + '" draggable=false class=tnimage></img>';
		$('#tn').html(imagehtml);
		resolve(i);
        });
}
function progress(i) {
	return () => new Promise((resolve, reject) => {
		//fs.writeFileSync(filepaths[i], fs.readFileSync(croppedfilelist[i]));
		//console.log("trying to write: "+croppedfilelist[i]+" => "+ filepaths[i]);
		stop = Math.round(100 * (i + 1) / filelist.length);
		var elem = document.getElementById("myBar");
		start = lastperc;
		var width = start;
		//$('#myBar').animate({width:stop+'%'});
		var id = setInterval(frame, 30);

		function frame() {
			if (width >= stop) {
				clearInterval(id);
				resolve(i);
				if (i + 1 == filelist.length) {
                        		elem.style.width = "0%";
                        		$('#myBar').css('width', '0%');
                        		document.getElementById("label").innerHTML = "0%";
								lastperc=0;
                        		$('#activefile').hide();
                        		$('#progressmsg').hide();
                        		$('#myProgress').hide();
								$('#tn').hide();
								$('#croppedlistwrap').fadeIn();
								$('#home').fadeIn();
								$('#done').fadeIn();
                		}
			} else {
				width++;
				elem.style.width = width + '%';
				document.getElementById("label").innerHTML = width * 1 + '%';
			}
		}
		lastperc = stop;
		if (i<filelist.length-1){
			//console.log('file:'+filepaths[i+1]);
			var filename = filepaths[i+1].replace(/^.*[\\\/]/, '');
			$('#activefile').html('creating: '+filename);
			//$('#croplist').append(originals[i+1]+'=>'+filepaths[i+1]+'<br>');
		}
	});
}
function setupcrop(i){
	return () => new Promise((resolve, reject) => {
		$('#confirm').hide();
		$('#home').hide();
		$('#preview').hide();
		$('#previewsize').hide();
        	$('#previewsizetext').hide();
		$('#cropbtn').hide();
		$('#manualbtn').hide();
		$('#progressmsg').fadeIn();
		$('#activefile').fadeIn();
		$('#myProgress').fadeIn();
		$('#tn').fadeIn();
		resolve(i);
    });
}

$('#cropbtn').click(function() { //SET UP CROPPING TASKS AND DO IT!
    //spawnsync('cmd.exe', ['/c','DEL','/s', '/q', workdir]); //CLEAR
	var myqueue = [];
	croppedfilelist=[];
	var filename = filepaths[0].replace(/^.*[\\\/]/, '')
	$('#activefile').html('creating: '+filename);
	//$('#croplist').append(originals[0]+'=>'+filepaths[0]+'<br>');
	myqueue.push(setupcrop(1));
	//BUILD CROP AND DIM ARRAY
	for (var i = 0; i < filelist.length; i++) {
		nexti = i + 1;
		myqueue.push(updatetn(i));
		//var nameonly = filelist[i].split("/");
                //var path = nameonly.splice(-1,1);
                //path = path.join('/');
                //nameonly = nameonly.slice(-1);
                //nameonly = nameonly.join();
                //var ext = nameonly.split(".").slice(-1);
                //var basename = nameonly.split(".").splice(-1,1);
		var croppath = path.dirname(filelist[i]);
		console.log("PATH: "+croppath);
		var basename = path.basename(filelist[i]);
		var ext = basename.split('.');
		ext = '.'+ext[ext.length-1];
		basename = path.basename(filelist[i], ext);

		//basename.splice(-1,1);
		console.log('BASE:'+basename);
		if (isclip(filelist[i])) {
			var cropfile = croppath+'/'+basename + '_crop.mp4';
			var croppixel = croppixelarr[i];
			var outfile = workdir + '/' + nexti + '.mp4';
			if(!window.cropW){
                                var cropvftext = 'setsar=1,scale=trunc(iw/2)*2:trunc(ih/2)*2,crop=in_w:in_h-' + croppixel + ':0:' + croppixel;
                        } else {
			var cropWidth=Math.round(window.cropW*widtharr[i]/500);
			var cropHeight=Math.round(window.cropH*widtharr[i]/500);
			var cropXstart=Math.round(window.cropX*widtharr[i]/500);
			var cropYstart=Math.round(window.cropY*widtharr[i]/500);
			var cropvftext = 'setsar=1,scale=trunc(iw/2)*2:trunc(ih/2)*2,crop='+cropWidth+':'+cropHeight+':'+cropXstart+':'+cropYstart;
			}
			 myqueue.push(customSpawn(ffmpegpath, ['-i', filelist[i], '-an','-map_metadata','-1', '-vf', cropvftext, '-c:v', 'libx264','-preset', 'medium', '-crf', '14','-y', '-pix_fmt', 'yuv420p', cropfile]));
		} else {
			var cropfile = croppath+'/'+basename + '_crop.jpg';
			if(!window.cropW){
			var percent = window.croppixelperc * 100;
			var croppixels = '0x' + percent + '%';
			myqueue.push(customSpawn(magickpath, ['convert', filelist[i], '-interlace', 'line', '-chop', '0x'+croppixels, cropfile]));
			} else {
			var cropWidth=Math.round(window.cropW*widtharr[i]/500);
                        var cropHeight=Math.round(window.cropH*widtharr[i]/500);
                        var cropXstart=Math.round(window.cropX*widtharr[i]/500);
                        var cropYstart=Math.round(window.cropY*widtharr[i]/500);
			var cropgeo=cropWidth+'x'+cropHeight+'+'+cropXstart+'+'+cropYstart;
			myqueue.push(customSpawn(magickpath, ['convert', filelist[i], '-interlace', 'line','-crop', cropgeo, cropfile]));
			}


			//EXAMPLE: convert 1.jpg -interlace line -chop 0x9% out.still.jpg
			//croppedfilelist.push(outfile);
		}
		$('#croplist').append(filelist[i]+'=>'+cropfile+'<br>');
		myqueue.push(progress(i));
	}
	//LAST ITEM IN QUEUE, CALL FINISH
		//myqueue.push($('#home').click());
	queue(myqueue).then(([cmd, args]) => {
		//console.log(cmd + ' finished - all finished');
	}).catch(TypeError, function(e) {}).catch(err => console.log(err));


});

var originals =[];
var filelist=[];
var filepaths=[];
//var origins = [];
function preview() {
	//spawnsync('cmd.exe', ['/c','DEL','/s', '/q', workdir]); //CLEAR
	var myqueue = [];
	previewindex = previewindex + 1;
	$('#img-grid').html('');

	widtharr = [];
	heightarr = [];
	croppixelarr = [];
	myqueue = [];
	var skip=0;
	originals=filelist.slice();
	for (var i = 0; i < filelist.length; i++) {
		var nameonly = filelist[i].split("\\");
		nameonly = nameonly.slice(-1);
		nameonly = nameonly.join();
		var ext = nameonly.split(".").slice(-1);
		//fs.writeFileSync(workdir + '\\' + 'original_'+i + '.' + ext, fs.readFileSync(filelist[i]));

		var nameonly = filelist[i].split("\\");
                nameonly = nameonly.slice(-1);
                nameonly = nameonly.join();
                var ext = nameonly.split(".").slice(-1);

		 var basename = nameonly.split(".");
		 basename.pop();
		 basename = basename.join(".");
		 var folderonly = filelist[i].split("\\");
		 folderonly.pop();
		 folderonly = folderonly.join("\\");
		 filecrop=folderonly+'\\'+basename+'_crop.'+ext;
		 filepaths.push(filecrop);
		 //filelist[i] = workdir + '\\' + 'original_'+i + '.' + ext;
		var nexti = i + 1;
		var outfile = workdir + '/' + nexti + '.' + previewindex + '.png';
		if (isstill(filelist[i])) {
		    //console.log(filelist[i]);
			var identify = spawnsync(magickpath, ['convert', filelist[i], '-ping', '-format', '%w:%h', 'info:']);
			/*
			identify = spawnsync('cmd.exe', ['/c',  '"'+identifypath+'"', '-ping' ,'-format','%w:%h', filelist[i]], {
				stdio: ['pipe', 'pipe', 'pipe'],
				windowsVerbatimArguments: true
			});
			*/
			//console.log(identify.stderr.toString());

			if (identify.status.toString() == 0) {
				//console.log(filelist[i] + ' passed as image');
				var imageinfo = identify.stdout.toString();
				height = imageinfo.split(':')[1];
				width = imageinfo.split(':')[0];
				if (width < 50 || height < 50) {
					var filename = filepaths[i].replace(/^.*[\\\/]/, '');
					$('#croplist').append(originals[i].toString()+' was removed because it was a tiny image'+'<br>');
					//console.log("TRYING TO REMOVE "+ filelist[i] + ', width='+width);
					//$('#croplist').append(')

					filelist.splice(i, 1);
					filepaths.splice(i,1);
					originals.splice(i, 1);
					i = i - 1;
					skip = 1;
				} else {
					//CONVERT MODIFY
					//var croppixel = 2 * Math.round(height * window.croppixelperc / 2);
                    			//var croppedheight = height - croppixel;
                    			widtharr.push(width);
                    			heightarr.push(height);
                    			croppixelarr.push(croppixel);
					var percent = window.croppixelperc * 100;
					var croppixels = '0x' + percent + '%';
					//console.log(filelist[i] + ':'+croppixels);
					//var convertout = spawnsync('cmd.exe', ['/c', convertpath, filelist[i], '-interlace', 'line', '-chop', croppixels, '-resize', '300', outfile]);
					//console.log(convertout.stderr.toString());
					//myqueue.push(customSpawn('cmd.exe', ['/c',convertpreviewbatpath, croppixels, filelist[i], outfile]));
					//myqueue.push(customSpawn('cmd.exe', ['/c', '"'+convertpath+'"', filelist[i], '-interlace', 'line', '-chop', croppixels, '-resize', '300', outfile]));
						if(!window.cropW){
			            var percent = window.croppixelperc * 100;
			            var croppixels = '0x' + percent + '%';
						 			myqueue.push(customSpawn(magickpath, ['convert', filelist[i], '-interlace', 'line', '-chop',croppixels , '-resize', '650', outfile]));
			       } else {
									var cropWidth=Math.round(window.cropW*widtharr[i]/500);
				          var cropHeight=Math.round(window.cropH*widtharr[i]/500);
				          var cropXstart=Math.round(window.cropX*widtharr[i]/500);
				          var cropYstart=Math.round(window.cropY*widtharr[i]/500);
				          var cropgeo=cropWidth+'x'+cropHeight+'+'+cropXstart+'+'+cropYstart;
				          myqueue.push(customSpawn(magickpath, ['convert', filelist[i],'-crop', cropgeo, '-resize', '650', outfile]));
				      }
		//			myqueue.push(customSpawn(magickpath, ['convert', filelist[i], '-interlace', 'line', '-chop',croppixels , '-resize', '650', outfile]));
				}
			} else {
				var filename = filepaths[i].replace(/^.*[\\\/]/, '');
				$('#croplist').append(originals[i].toString()+' was ignored because it was not an image file'+'<br>');
				console.log(originals[i].toString());
				filelist.splice(i, 1);
				originals.splice(i, 1);
				filepaths.splice(i,1);
				i = i - 1;
				skip=1;
			}
		} else {
			//console.log('looks like a video...');
			//ffprobe = spawnsync( 'cmd.exe', ['/c', ffprobepath, '-print_format', 'json', '-show_streams', '-i', filelist[i]]);
			ffprobe = spawnsync(ffprobepath, ['-print_format', 'json', '-show_streams', '-i', filelist[i]]);
			//ffprobe = spawnsync( 'cmd.exe', ['/c', ffprobebatpath,filelist[i]])
			//console.log(ffprobe.stdout.toString());
			if (ffprobe.status.toString() == 0) {
				ffprobeOb = JSON.parse(ffprobe.stdout);
				width = ffprobeOb.streams[0].width;
				height = ffprobeOb.streams[0].height;
				var croppixel = 2 * Math.round(height * window.croppixelperc / 2);
				widtharr.push(width);
				heightarr.push(height);
				croppixelarr.push(croppixel);
				//console.log(width, height);
				//var ffmpeg = spawnsync('cmd.exe', ['/c', ffmpegpreviewbatpath, croppixel,filelist[i], outfile]);
				//console.log(ffmpeg.stderr.toString());
				//myqueue.push(customSpawn('cmd.exe', ['/c', ffmpegpreviewbatpath, croppixel,filelist[i], outfile]));
			if(!window.cropW){
				var cropvftext = 'setsar=1,scale=trunc(iw/2)*2:trunc(ih/2)*2,crop=in_w:in_h-' + croppixel + ':0:' + croppixel + ',scale=650:-1';
			} else {
                        var cropWidth=Math.round(window.cropW*widtharr[i]/500);
                        var cropHeight=Math.round(window.cropH*widtharr[i]/500);
                        var cropXstart=Math.round(window.cropX*widtharr[i]/500);
                        var cropYstart=Math.round(window.cropY*widtharr[i]/500);
                        var cropvftext = 'setsar=1,scale=trunc(iw/2)*2:trunc(ih/2)*2,crop='+cropWidth+':'+cropHeight+':'+cropXstart+':'+cropYstart + ',scale=650:-1';
			}
				myqueue.push(customSpawn(ffmpegpath, ['-i', filelist[i], '-an', '-vf', cropvftext, '-pix_fmt', 'rgb24', '-vframes', '1', '-f', 'image2', '-y', outfile]));
			} else {
				var filename = filepaths[i].replace(/^.*[\\\/]/, '');
				$('#croplist').append(originals[i].toString()+' was ignored because it was not an image file'+'<br>');
				console.log(originals[i].toString());
				originals.splice(i, 1);
				filelist.splice(i, 1);
				filepaths.splice(i,1);
				i = i - 1;
				skip=1;
			}
		}
		if (skip!=1) {
			myqueue.push(previewdump(nexti));
		} else {
			skip=0;
		}
	}
	$('#loading-container').hide();
	$('#preview').show();
	$('#previewsize').show();
	$('#previewsizetext').show();
	myqueue.push(showbtns());
	queue(myqueue).then(([cmd, args]) => {
		console.log(cmd + ' finished - all finished');
	}).catch(TypeError, function(e) {}).catch(err => console.log(err));
}

function previewdump(i) {
	return () => new Promise((resolve, reject) => {
		outfile = workdir + '/' + i + '.' + previewindex + '.png';
		//heightcrop = Math.round((heightarr[i - 1] - croppixelarr[i - 1]) * 300 / widtharr[i - 1]);
		//var imagehtml = '<div class="previewimg"><img class="previewstill" src="' + outfile + '" draggable=false></img></div>';
		var imagehtml = '<div class="previewimg"><img class="previewstill" src="' + outfile + '" draggable=false style="width:'+previewimgpx+'"></img></div>';
		$('#img-grid').append(imagehtml);
		//console.log(imagehtml);
		resolve(i);
	});
}
$('#manualbtn').click(function() {
	window.caliperdraw = true;
	window.draw = false;
	$('#preview').hide();
	$('#previewsize').hide();
        $('#previewsizetext').hide();
	dim = canvasbg(filelist);
	width = dim.streams[0].width;
	height = dim.streams[0].height;
	canvasaspect = height / width;
	$('#myCanvas').css("background-image", "url(" + previewfile + ")");
	canvasheight = 500 * canvasaspect;
	//$('#highlight').css("line-height",canvasheight+"px");
	$('#myCanvas').attr('height', canvasheight);
	$('#canvaswrap').fadeIn();
	$('#highlight').fadeIn();
	$('#manualOKbtn').fadeIn();
	$('#manualbtn').fadeOut();
	$('#cropbtn').fadeOut();
	$('#confirm').hide();
	//$('#home').hide();
});
$('#manualOKbtn').click(function() {
	$(this).hide();
	$('#canvaswrap').hide();
	$('#highlight').hide();
	$('#loading-container').show();
	setTimeout(function() {
		preview(window.croppixelperc);
		$('#preview').show();
		$('#previewsize').show();
        	$('#previewsizetext').show();
		$('#loading-container').hide();
	}, 10);
});
$('#myCanvas').click(function() {
	//console.log(Math.round(window.cropY / canvasaspect));
});
$('#filelistbtn').click(function() {
	$('#filelistwrap').hide();
	for (var i = 0; i < filelist.length; i++) {
		$('#filelist').append(i + ': ' + filelist[i] + '<br />');
		addtofilelist(i + ': ' + filelist[i] + '<br />');
	}
	$('#filelistwrap').show();
	$('body, html').scrollLeft(1000);
	$(this).hide();
	$('#previewbtn').fadeIn();
	$('#addbtn').fadeIn();
});
$('#addbtn').click(function() {
	$('#filelist').html('');
	$('#filelistwrap').hide();
	$('#filelistwrap').show();
	$(this).hide();
	$('#filelistbtn').fadeIn();
});

function addfilestatus() {
	var clipnum = 0;
	var stillnum = 0;
	for (var i = 0; i < filelist.length; i++) {
		if (isclip(filelist[i])) {
			clipnum = clipnum + 1;
		}
		if (isstill(filelist[i])) {
			stillnum = stillnum + 1;
		}
	}
	$('#addfilestatus').html(clipnum + ' clips, ' + stillnum + ' stills added');
	$('#addfilestatus').show();
}
$('#add').click(function(){
	$('#finallinkwrap').hide();
	$('#addornew').hide();
	//console.log('trying to load');
	loadmyarchives();
});


$('#okselect').click(function() {
	//console.log($('#myarchives').val());
	folder=$('#myarchives').val();
	$('#addselect').hide();
	$('#filelistwrap').fadeIn();
});
$('#home').click(function() {
	addfiledelay=0;
	$('#done').hide();
	$('#confirm').hide();
	$('#activefile').hide();
	$('#activefileUL').hide();
	$('#addselect').hide();
	$('#canvaswrap').hide();
	$('#clearbtn').hide();
	$('#cropbtn').hide();
	$('#filelistwrap').hide();
	$('#finallinkwrap').hide();
	$('#highlight').hide();
	$('#loading-container').hide();
	$('#myProgress').hide();
	$('#myProgressUL').hide();
	$('#newtitle').hide();
	$('#preview').hide();
	$('#previewsize').hide();
        $('#previewsizetext').hide();
	$('#previewbtn').hide();
	$('#progressmsg').hide();
	$('#progressmsgUL').hide();
	$('#manualOKbtn').hide();
	filelist = [];
	filepaths= [];
        $('#filelist').html('');
	$(this).hide();
	addfilestatus();
	$('#filelistwrap').fadeIn();
	$('#addfilestatus').hide();
	$('#croplist').html('');
	$('#croppedlistwrap').hide();
        $('#drag').css('visibility','visible');
	$('#manualbtn').hide();
	//$('button').hide();
});
window.addEventListener('beforeunload', onbeforeunload);
/*
	$(".range").slider({
    min: 50,
    value: 200,
    max: 600,
    orientation: "horizontal",
    range: "min",
    animate: true,
   slide: function( event, ui ) {
      //console.log(ui.value);
        //var newval =
        $('img').css('width', ui.value+'px');
    }
  });
*/
console.log(jQuery().jquery);
require('jquery-ui-bundle');
var previewimgpx;
$(document).ready(function(){
        $(".range").slider({
    min: 50,
    value: 350,
    max: 650,
    orientation: "horizontal",
    range: "min",
    animate: true,
   slide: function( event, ui ) {
      //console.log(ui.value);
        //var newval =
	previewimgpx=ui.value+'px';
        $('.previewstill').css('width', ui.value+'px');
    }
  });
});

