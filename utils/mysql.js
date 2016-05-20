
var mysql = require('mysql');
var fs = require('fs');
/**************************工具类部分********************************/


/***
 * 首字母大写
 *
 * */
String.prototype.firstUpperCase=function(){
	return this.replace(/^\S/,function(s){return s.toUpperCase();});
}
/***
 * 下划线转驼峰
 * **/
String.prototype.humpUpperCase=function(){
	return this.replace(/^\S/,function(s){return s.toUpperCase();}).replace(/_\S/g,function (s) {
		return s.replace(/_/,"").toUpperCase();
	});
}


/**************************************工具类部分结束*****************************/



/***
 * 数据库配置字典
 * */
var dbs = new Object({
	"local" : mysql.createPool({
		host: 'localhost',
		user: 'root',
		password: '654321',
		database: 'ib_admin',
		port: 3306
	}),
	"ibAdmin" : mysql.createPool({
		host: '172.20.9.180',
		user: 'root',
		password: 'root',
		database: 'ib_admin',
		port: 3306,
		insecureAuth: true

	})
});

/**********************************************生成 java bean 部分******************************/

/***
 *该死的node 异步执行，只能函数嵌套了
 *
 * **/

function  autoJavaBean(key,table,path){

    var pool= dbs[key];
    pool.getConnection(function (err, conn) {
        if(err){
            alert("db connection error");
        }else{
            path=path+table.humpUpperCase()+"Bean.java";
            fs.exists(path,function(exist){
                if(exist){
                    alert("the java bean is already");
                }else{
                    writeJavaBeanByTable(conn,table,path);
                    alert("success");
                }
            });
        }
    });
}



/****
 * 读取数据库表配置，并根据配置生成javaBean
 * **/
function  writeJavaBeanByTable(conn,table,path){

	//conn.connect();
	var selectSQL = 'show full fields from  '+table;
    console.log(conn);
	conn.query(selectSQL, function(err, rows, fields) {
		if (err) throw err;

		fs.appendFileSync(path,"public class "+table.humpUpperCase()+ "Bean { \n");

		for (var index in rows){

			writeAttribute(path,rows[index]["Field"],rows[index]["Type"],
				rows[index]["Default"],rows[index]["Comment"]);

		}
		fs.appendFileSync(path,"\n");
		for(var index in rows){
			writeGetSet(path,rows[index]["Field"],rows[index]["Type"]);
		}
		fs.appendFileSync(path,"\n}");
        conn.release();
	});
}



/****
 * 根据字段的类型仅仅推断 int、long、string ；其中 日期类型默认为sting；
 * 如果有默认值且非空则赋值
 *
 * **/
function writeAttribute (path,field,type,defaultVal,comment){

	fs.appendFileSync(path,"\n    /****"+comment+"*****/ \n");
	var typ=type.toLowerCase();
	var str;
	if(typ.indexOf("bigint")>-1){
		str="    private long ";
	} else if(typ.indexOf("int")>-1){
		str="    private int ";
	} else {
		str="    private String ";
	}
	str=str+field +defaultAttribute(defaultVal)+";\n";
	fs.appendFileSync(path,str);
}
/****
 * 判断字段的默认值，未定义、空字符、null 都不赋值；
 * */
function defaultAttribute(defaultVal){

	if(typeof(defaultVal) != "undefined"&& defaultVal!="" && defaultVal != null ){
		defaultVal = " = "+defaultVal+";";
	}else {
		defaultVal="";
	}
	return defaultVal;
}
/****
 *生成驼峰命名式的set 和 get 方法
 *
 * */
function  writeGetSet(path,field,type){

	var methodName= field.humpUpperCase();
	var typ=type.toLowerCase();
	var getVal;
	var setVal;
	if(typ.indexOf("bigint")>-1){
		getVal="    public long get";
		setVal="    public void set"+methodName+"(long "+field+")";
	} else if(typ.indexOf("int")>-1){
		getVal="    public int get";
		setVal="    public void set"+methodName+"(int "+field+")";
	} else {
		getVal="    public String get";
		setVal="    public void set"+methodName+"(String "+field+")";
	}
	getVal=getVal+methodName+"(){\n"+"        return "+ field+";\n    }\n";
	setVal=setVal+"{\n"+"        this."+field+"="+field+";\n    }\n";
	fs.appendFileSync(path,getVal);
	fs.appendFileSync(path,setVal);

}

/*****************************************生成java bean 部分 结束 **************************/

//autoJavaBean("ibAdmin","zs_app_upload","L:\\")

/**************************************生成 dao service controller ***********************/
/*****
 *生成 dao service 和 controller
 * ******/
function autoDaoServiceController(table,path){

    var name=table.humpUpperCase();
    autoDao(path,name);
    autoService(path,name);
    autoController(path,name);
    alert("success");
}

/*************
 * 生成 dao 层
 * ***/
function autoDao(path,name){

    var dpath=path+name+"Dao.java";
    var dpathimpl=path+name+"DaoImpl.java";
    fs.exists(dpath,function(exist){
        if(!exist) {
            fs.appendFileSync(dpath,"public interface "+name+"Dao {\n}");
        }
    });
    fs.exists(dpathimpl,function(exist){
        if(!exist) {
            fs.appendFileSync(dpathimpl,"import org.springframework.stereotype.Repository;\n\n@Repository\n"
                +"public class "+name+"DaoImpl implements "+ name+"Dao {\n}");
        }
    });

}
/***********生成 Service***/
function autoService(path,name){

    var spath=path+name+"Service.java";
    var spathimpl=path+name+"ServiceImpl.java";
    fs.exists(spath,function(exist){
        if(!exist) {
            fs.appendFileSync(spath,"public interface "+name+"Service {\n}");
        }
    });
    fs.exists(spathimpl,function(exist){
        if(!exist) {
            fs.appendFileSync(spathimpl, "import org.springframework.stereotype.Service;"
                +"\n\n@Service\npublic class " + name
                + "ServiceImpl implements "
                + name + "Service {\n}");
        }
    });

}
/********生成 controller*******/
function autoController(path,name){
    var cpath=path+name+"Controller.java";
    fs.exists(cpath,function(exist){
        if(!exist) {
            fs.appendFileSync(cpath,"import org.springframework.stereotype.Controller;"
                +"\n\n@Controller\npublic class "
                +name+"Controller {\n}");
        }
    });
}