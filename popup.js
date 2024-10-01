window.onload = function () {
    getLength = (value) => {
        if (!value) {
            return 0
        }
        const charCount = value.split('').reduce((prev, curr) => {
          // 英文字母和数字等算一个字符；这个暂时还不完善；
        if (/[a-z]|[0-9]|[,;.!@#-+/\\$%^*()<>?:"'{}~]/i.test(curr)) {
            return prev + 1
        }
          // 其他的算是2个字符
            return prev + 2
        }, 0)

        return charCount
    }

    var btn_save_all = document.getElementById("saveAll");
    var btn_open_all = document.getElementById("openAll");
    var btn_delete = document.getElementById("delete");
    var btn_share = document.getElementById("share");
    var btn_import = document.getElementById("import");
    var btn_export = document.getElementById("export");
    var tips_info = document.getElementById("tips_info");
    var input = document.getElementById("input");
    var clampsList = document.getElementById("clampsList");
    var innerList = document.getElementById("innerList");
    var fileInput = document.getElementById("fileInput");
    var allClampsArray = [];
    var current = {};
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).indexOf("clamps_") == -1) continue;
        item = {}
        item['name'] = localStorage.key(i).replace("clamps_", "");
        item['htmlDelta'] = item['name'] + "(" + JSON.parse(localStorage.getItem(localStorage.key(i))).size + ")"
        item['timeStamp'] = JSON.parse(localStorage.getItem(localStorage.key(i))).timeStamp
        allClampsArray.push(item)
    }
    
    if (localStorage["settings_outer_order"] == 'first_letter') {
        allClampsArray.sort((a, b) => a['name'].localeCompare(b['name']));
    } else if (localStorage["settings_outer_order"] == 'time_order') {
        allClampsArray.sort((a, b) => a['timeStamp'] - b['timeStamp']);
    }


    for (var i = 0; i < allClampsArray.length; i++) {
        var name = allClampsArray[i]['name']
        var htmlDelta =  allClampsArray[i]['htmlDelta']
        htmlDelta = '<button style="margin-left:10px; width:150px;" id="clamps_' + i + '" class="btn btn-outline-dark btn-sm clampsListBtns" name="' + name + '">' + htmlDelta + '</button>';
        clampsList.innerHTML += htmlDelta;
        if (i % 3 == 2){
            clampsList.innerHTML += "<br>";
        }
    }
    var clampsListBtns = document.getElementsByClassName("clampsListBtns");
    for (var i = 0; i < clampsListBtns.length; i++) {
        clampsListBtns[i].onclick = function () {
            selectedName = this.getAttribute('name');
            clampsOnClick(selectedName);
            innerList.innerHTML = ""
            current = JSON.parse(localStorage.getItem("clamps_" + selectedName));
            if (localStorage["settings_inner_order"] == 'url_order') {
                current.data.sort((a, b) => a.url.localeCompare(b.url));
            } else if (localStorage["settings_inner_order"] == 'title_order') {
                current.data.sort((a, b) => a.title.localeCompare(b.title));
            }
            console.log(current)
            for (var i = current.data.length - 1; i >= 0; i--) {
                innerList.innerHTML += '<li class="innerListItems">' + 
                    '<img src="' + current.data[i].favIconUrl + '" width="16px" height="16px"/> ' + 
                    '<a target="_blank" href="' + current.data[i].url + '">' + current.data[i].title + '</a>' + "</li>";
            }
        }
    }
    btn_save_all.onclick = function () {
        if (input.value == "") {
            tips_info.innerHTML = "请输入你要操作的标签夹的名字";
            return;
        }

        tips_info.innerHTML = getLength(input.value);
        if (getLength(input.value) > 14) {
            tips_info.innerHTML = "不能超过14个字符, 中文算2个字符, 英文算1个字符";
            return;
        }
        var forumTabs = new Array();
        chrome.tabs.query({}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                forumTabs[i] = tabs[i];
            }
            current.data = [];
            for (var i = 0; i < forumTabs.length; i++) {
                if (forumTabs[i] != null) {
                    current.data.push(forumTabs[i]);
                }
            }
            current.name = input.value;
            current.size = tabs.length;
            current.timeStamp = Date.now();
            localStorage.setItem("clamps_" + input.value, JSON.stringify(current));
            location.reload(false);
        });
    }
    btn_open_all.onclick = function () {
        if (input.value == "") {
            tips_info.innerHTML = "请输入你要操作的标签夹的名字";
            return;
        }

        current = JSON.parse(localStorage.getItem("clamps_" + input.value));
        if (current == null) {
            tips_info.innerHTML = "不存在该标签夹：" + input.value;
            return;
        }
        for (var i = current.size - 1; i >= 0; i--) {
            //tips_info.innerHTML += "<li>" + current.data[i].title+"</li>";
            chrome.tabs.create({
                'url': current.data[i].url,
                'selected': false
            }, function (tab2) {});
        }
    }
    btn_delete.onclick = function () {
        current = JSON.parse(localStorage.getItem("clamps_" + input.value));
        if (input.value == "") {
            tips_info.innerHTML = "请输入你要操作的标签夹的名字";
            return;
        }
        if (current == null) {
            tips_info.innerHTML = "不存在该标签夹：" + input.value;
            return;
        }

        localStorage.removeItem("clamps_" + input.value);
        location.reload(false);
    }
    btn_share.onclick = function () {
        if (input.value == "") {
            tips_info.innerHTML = "请输入你要操作的标签夹的名字";
            return;
        }
        const blob = new Blob([innerList.innerHTML], {type : "text/plain"})
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = "分享标签夹-" + input.value + ".html";
        document.body.appendChild(a);

        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
    btn_import.onclick = function () {
        fileInput.click();
    }
    btn_export.onclick = function () {
        result_to_export = {};
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).indexOf("clamps_") == -1) continue;
            var name = localStorage.key(i).replace("clamps_", "");
            result_to_export[name] = localStorage.getItem(localStorage.key(i));
        }
        
        const blob = new Blob([JSON.stringify(result_to_export)], {type : "text/plain"})
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = "标签夹导出数据.json";
        document.body.appendChild(a);

        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
    fileInput.onchange = function (e) {
        const file = e.target.files[0];
        var cnt = 0;
        var failed = 0;
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = JSON.parse(e.target.result);

                for (let key in content) {
                    if (localStorage.getItem("clamps_" + key)) {
                        failed += 1;
                    } else if (content.hasOwnProperty(key)) {
                        localStorage.setItem("clamps_" + key, content[key]);
                    }
                    cnt += 1;
                }
                tips_info.innerHTML = "导入完成, 导入了 " + cnt.toString() + " 个, 自动跳过 " + failed.toString() + " 个已存在的标签夹。5秒后将自动刷新。";
                setTimeout(function() {location.reload(false);}, 5000);
            };
            reader.readAsText(file);
        }
    }

    function clampsOnClick(name) {
        input.value = name;
    }
}