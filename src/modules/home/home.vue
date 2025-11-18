<template>
<div class="home_warpper1">
    <div class="home_bg_panle">
        <div class="home_bg_h1">Welcome to BFA Portal</div>
    </div>
    <div class="home_bg_h2">This portal provides access to the following functionalities :</div>

    <div class="main_home_warpper">
    <div class="home_warpper">
        <div class="home_box1">
            <div class="home_lable_h1">DASHBOARD</div>
            <div class="home_lable_h2">This portal provides access to the following functionalities</div>
            <div class="home_btn">
                <a class="btn_primary_1" >
                    Add Discount 
                    <span class="material-symbols-outlined btn_primary_1_icon">
                        arrow_right_alt
                    </span>
                </a>
            </div>
        </div>


        <div class="home_box2">
            <div class="home_lable_h1">BFA</div>
            <div class="home_lable_h2">This portal provides access to the following functionalities</div>
            <div class="home_btn">
                <a class="btn_primary_1" >
                    Add Discount 
                    <span class="material-symbols-outlined btn_primary_1_icon">
                        arrow_right_alt
                    </span>
                </a>
                </div>
        </div>


        <div class="home_box1">
            <div class="home_lable_h1">ANNUAL BILLING</div>
            <div class="home_lable_h2">This portal provides access to the following functionalities</div>
            <div class="home_btn">
                <a class="btn_primary_1" >
                    Add Discount 
                    <span class="material-symbols-outlined btn_primary_1_icon">
                        arrow_right_alt
                    </span>
                </a>
                </div>
        </div>


        <div class="home_box2">
            <div class="home_lable_h1">REPORT</div>
            <div class="home_lable_h2">This portal provides access to the following functionalities</div>
            <div class="home_btn">
                <a class="btn_primary_1" >
                    Add Discount 
                    <span class="material-symbols-outlined btn_primary_1_icon">
                        arrow_right_alt
                    </span>
                </a>
                </div>
        </div>

         

    </div>
    </div>
</div>

</template>
<script>
export default {
  name: 'HomeView' // <-- Multi-word name to satisfy vue/multi-word-component-names
}
</script>
<style scoped>  
.main_home_warpper {
    width: 100%;
    float: left;
    /* margin-bottom: 100px; */
}
.home_bg_panle {
    /* background-image: url(../Image/registration_banner.jpg);*/
    background-image: url(https://www.liscr.com/LISCR/media/Resources/Pages/maritime_v1/maritime_body_bg.jpg);
    background-size: cover;
    background-position: 100% 20%;
    max-height: 350px;
    height: 350px;
    background-repeat: no-repeat;
}
.home_bg_h1 {
    text-align: center;
    font-size: 48px;
    color: #fff;
    padding-top: 100px;
    width: 620px;
    margin: auto;
    font-weight: 500;
    line-height: 65px;
}
.home_bg_h2 {
    text-align: center;
    font-size: 18px;
    padding: 40px 0px;
    text-transform: capitalize;
}
.home_warpper {
    width: 100%;
    margin: auto;
    max-width: 1680px;
}
.home_box1 {
    width: 24%;
    float: left;
    border-right: 0px solid #f2f2f2;
    height: 300px;
    padding: 63px 21px;
    background: #fafafa;
    text-align: center;
/*    box-shadow: 8px 2px 12px 1px #ccc;*/
}
.Collections_bg {
    background: #fff;
}
.home_box2 {
    width: 24%;
    float: left;
    border-right: 0px solid #f2f2f2;
    height: 300px;
    padding: 63px 21px;
    background: #fff;
    text-align: center;
}
.home_lable_h1 {
    color: #00B0C6;
    font-size: 20px;
    font-weight: 600;
    padding: 0px 0px 8px;
}
.home_lable_h2 {
    color: #4d4d4d;
    font-size: 16px;
    font-weight: 400;
    padding: 0px 0px 8px;
    height: 105px;
}
.home_btn {
    position: relative;
}

.btn_primary_1 {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    text-decoration: none;
    cursor: pointer;
    border: 1px solid #00B0C6;
    border-radius: 60px;
    height: 2.8em;
    width: 173px;
    padding: 0;
    outline: none;
    overflow: hidden;
    /* color: #00B0C6; */
    color:black;
    transition: color 0.3s 0.1s ease-out;
    text-align: center;
    line-height: 250%;
    z-index: 9;
}
    .btn_primary_1::before {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        content: "";
        border-radius: 50%;
        display: block;
        width: 20em;
        height: 20em;
        line-height: 20em;
        left: -5em;
        text-align: center;
        transition: box-shadow 0.5s ease-out;
        z-index: -1;
    }
    .btn_primary_1:hover {
        color: #fff !important;
    }
        .btn_primary_1:hover::before {
            box-shadow: inset 0 0 0 10em #00B0C6;
        }

.btn_primary_1_icon {
    padding: 9px 12px 0px 0px;
    float: right;
}
</style>
