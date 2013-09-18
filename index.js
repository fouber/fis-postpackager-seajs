/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';

module.exports = function(ret, settings, conf, opt){ //打包后处理
    //把配置文件中的seajs节点配置读出来
    var fis_sea_conf = fis.config.get('seajs', {});
    fis_sea_conf.alias = fis_sea_conf.alias || {};
    //构建别名表
    fis.util.map(ret.map.res, function(id, res){
        fis_sea_conf.alias[id] = res.uri;
    });
    //构造seajs的config.js配置文件
    var seajs_config = fis.file(fis.project.getProjectPath(), 'sea-config.js');
    //拼接字符串，生成sea.config调用
    seajs_config.setContent('seajs.config(' + JSON.stringify(fis_sea_conf, null, opt.optimize ? null : 4) + ');');
    //把新生成的文件放到打包文件输出表
    ret.pkg[seajs_config.subpath] = seajs_config;
    //构造页面插入的script标签内容
    var script = '<script src="' + seajs_config.getUrl(opt.hash, opt.domain) + '"></script>';
    //找到所有的源码文件，对其进行配置文件script标签插入
    fis.util.map(ret.src, function(subpath, file){
        if(file.isHtmlLike){ //类html文件
            var content = file.getContent();
            if(/\bseajs\.use\s*\(/.test(content)){ //如果有sea.use(，才会插入
                //插入到页面</head>标签结束之前
                content = content.replace(/<\/head>/, script + '\n$&');
                file.setContent(content);
            }
        }
    });
};