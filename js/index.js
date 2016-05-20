/**
 * Created by lixy on 2016/5/17.
 */
$(function() {

    $("#javaBean").click(function () {
        var db=$("#db").val();
        var table=$("#table").val();
        var path=$("#path").val();
        autoJavaBean(db,table,path);

    });
    $("#DaoServiceController").click(function () {
        var table=$("#table").val();
        var path=$("#path").val();
        autoDaoServiceController(table,path);

    });
});