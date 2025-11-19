<template>
   <div class="hero-section">
        <h1 class="hero-title">Welcome to BFA Portal</h1>
    </div>
    
    <div class="content-section">
        <div class="intro-text">
            <p>This portal provides access to the following functionalities:</p>
        </div>
        
        <div class="cards-container">
            <div class="feature-card">
                <h3>Dashboard</h3>
                <p>This portal provides access to the following functionalities:</p>
                <a href="#" class="btn-add-discount">Add Discount</a>
            </div>
            
            <div class="feature-card">
                <h3>Agreements</h3>
                <p>This portal provides access to the following functionalities:</p>
                <a href="#" class="btn-add-discount">Add Discount</a>
            </div>
            
            <div class="feature-card">
                <h3>Annual Billing</h3>
                <p>This portal provides access to the following functionalities:</p>
                <a href="#" class="btn-add-discount">Add Discount</a>
            </div>
            
            <div class="feature-card">
                <h3>Reports</h3>
                <p>This portal provides access to the following functionalities:</p>
                <a href="#" class="btn-add-discount">Add Discount</a>
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
      
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
        }
        
        .hero-section {
            position: relative;
            height: 400px;
            width: 100%;
            background-image: url('https://www.liscr.com/LISCR/media/Resources/Pages/maritime_v1/maritime_body_bg.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(12, 74, 110, 0.5);
        }
        
        .ship-image {
            position: absolute;
            top: 50%;
            right: 10%;
            transform: translateY(-50%);
            width: 400px;
            height: auto;
            opacity: 0.9;
        }
        
        .hero-title {
            position: relative;
            z-index: 10;
            color: white;
            font-size: 36px;
            font-weight: 600;
            text-align: center;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .content-section {
            max-width: 1400px;
            margin: -50px auto 50px;
            padding: 0 20px;
            position: relative;
            z-index: 20;
        }
        
        .intro-text {
            text-align: center;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 40px;
        }
        
        .intro-text p {
            color: #6c757d;
            margin: 0;
            font-size: 16px;
        }
        
        .cards-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 25px;
        }
        
        .feature-card {
            background: white;
            border-radius: 12px;
            padding: 35px 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            text-align: center;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .feature-card h3 {
            color: #0c4a6e;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .feature-card p {
            color: #6c757d;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 25px;
            min-height: 60px;
        }
        
        .btn-add-discount {
            background: white;
            color: #0c4a6e;
            border: 2px solid #0c4a6e;
            padding: 10px 30px;
            border-radius: 25px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-add-discount:hover {
            background: #0c4a6e;
            color: white;
            transform: scale(1.05);
        }
        
        @media (max-width: 1200px) {
            .cards-container {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 768px) {
            .hero-section {
                height: 250px;
            }
            
            .hero-title {
                font-size: 28px;
            }
            
            .ship-image {
                width: 250px;
                right: 5%;
            }
            
            .cards-container {
                grid-template-columns: 1fr;
            }
        }
    </style>
