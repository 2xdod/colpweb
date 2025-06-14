// Admin hesabı oluşturma scripti
// Bu dosyayı script.js'den sonra HTML'e ekleyerek admin hesabını otomatik oluşturabilirsiniz

document.addEventListener('DOMContentLoaded', function() {
    // Admin hesabının var olup olmadığını kontrol et
    const users = JSON.parse(localStorage.getItem('colp-users')) || [];
    const adminExists = users.find(user => user.email === 'admin@colp.co');
    
    if (!adminExists) {
        // Admin hesabını oluştur
        const adminUser = {
            id: 'admin_' + Date.now(),
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@colp.co',
            password: 'admin123', // Gerçek uygulamada şifrelenmiş olmalı
            role: 'super_admin',
            newsletter: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        users.push(adminUser);
        localStorage.setItem('colp-users', JSON.stringify(users));
        
        console.log('Admin hesabı oluşturuldu: admin@colp.co / admin123');
    }
    
    // Test için bazı newsletter subscribers ekle
    const subscribers = JSON.parse(localStorage.getItem('colp-newsletter-subscribers')) || [];
    if (subscribers.length === 0) {
        const testSubscribers = [
            {
                id: 'sub_1',
                email: 'test1@example.com',
                subscribedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                active: true,
                source: 'footer',
                preferences: { promotions: true, newArrivals: true, stories: true }
            },
            {
                id: 'sub_2', 
                email: 'test2@example.com',
                subscribedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                active: true,
                source: 'registration',
                preferences: { promotions: true, newArrivals: false, stories: true }
            },
            {
                id: 'sub_3',
                email: 'newsletter-only@example.com',
                subscribedAt: new Date().toISOString(),
                active: true,
                source: 'footer',
                preferences: { promotions: false, newArrivals: true, stories: true }
            }
        ];
        
        localStorage.setItem('colp-newsletter-subscribers', JSON.stringify(testSubscribers));
        console.log('Test newsletter subscribers oluşturuldu');
    }
});