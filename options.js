function calculateLocalStorageSize() {
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalSize += (key.length + value.length);
    }
    // 按照合适的单位显示
    if (totalSize < 1024) {
        unit = " B";
    } else if (totalSize < 1024 * 1024) {
        totalSize /= 1024;
        unit = " KB";
    } else {
        totalSize /= 1024 * 1024;
        unit = " MB";
    }
    // 保留两位数字
    totalSize = totalSize.toFixed(2);
    return totalSize + unit;
  }

window.onload = function () {
    var btn_update_log = document.getElementById("updateLog");
    var btn_settings = document.getElementById("settings");
    var btn_reset = document.getElementById("reset");
    var div_update_log_content = document.getElementById("updateLogContent");
    var div_settings = document.getElementById("settingsContent");
    var settings_outer_order = document.getElementById("settings_outer_order");
    var settings_inner_order = document.getElementById("settings_inner_order");

    var div_local_storage_size = document.getElementById("local_storage_size");

    div_local_storage_size.innerHTML += calculateLocalStorageSize();

    const settings_order_value = localStorage.getItem("settings_outer_order");
    if (settings_order_value) {
        settings_outer_order.value = settings_order_value;
    }

    const settings_inner_value = localStorage.getItem("settings_inner_order");
    if (settings_inner_value) {
        settings_inner_order.value = settings_inner_value;
    }
    btn_update_log.onclick = function() {
        div_update_log_content.style.display = 'block';
        div_settings.style.display = 'none';
    };

    btn_settings.onclick = function() {
        div_update_log_content.style.display = 'none';
        div_settings.style.display = 'block';
    };

    btn_reset.onclick = function() {
        const confirmed = confirm('确定要重置 标签夹 TabClamp 吗？\n这将删除所有的标签夹数据和所有的设置数据。\n请慎重考虑。\n（如果插件出现异常可以使用这个按钮还原）');
        if (confirmed) {
            localStorage.clear();
            alert('标签夹 TabClamp 已重置。');
        }
    }

    settings_outer_order.onchange = function(e) {
        localStorage.setItem("settings_outer_order", e.target.value);
    }

    settings_inner_order.onchange = function(e) {
        localStorage.setItem("settings_inner_order", e.target.value);
    }
}