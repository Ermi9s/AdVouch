#!/usr/bin/env python
"""
Create comprehensive sample data for AdVouch platform testing
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'advouch.settings')
django.setup()

from users.models import User
from business.models import Business
from ads.models import Ad
from interactions.models import AdClick, AdView, SearchQuery, Share, Review, ServiceRatting
from reputation.models import Reputation

def create_users(count=10):
    """Create multiple test users"""
    print(f"\n{'='*60}")
    print(f"Creating {count} Users...")
    print(f"{'='*60}")
    
    users = []
    for i in range(1, count + 1):
        phone = f"+25191234{i:04d}"
        user, created = User.objects.get_or_create(
            phone_number=phone,
            defaults={
                'email': f'user{i}@advouch.com',
                'full_name': f'Test User {i}',
                'gender': random.choice(['Male', 'Female', 'Other']),
                'public': random.choice([True, False])
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"✓ Created user: {user.full_name} ({user.phone_number})")
        else:
            print(f"✓ User exists: {user.full_name} ({user.phone_number})")
        users.append(user)
    
    return users

def create_businesses(users, count=5):
    """Create multiple test businesses"""
    print(f"\n{'='*60}")
    print(f"Creating {count} Businesses...")
    print(f"{'='*60}")

    business_names = [
        "TechHub Solutions",
        "Creative Design Studio",
        "Digital Marketing Pro",
        "Web Development Co",
        "Mobile App Experts",
        "Cloud Services Inc",
        "Data Analytics Group",
        "AI Innovation Labs"
    ]

    businesses = []
    for i in range(count):
        owner = users[i % len(users)]
        name = business_names[i % len(business_names)]

        business, created = Business.objects.get_or_create(
            name=name,
            owner=owner,
            defaults={
                'description': f'Professional {name} providing top-quality services in Addis Ababa',
                'location': 'Addis Ababa, Ethiopia'
            }
        )
        
        if created:
            print(f"✓ Created business: {business.name} (Owner: {owner.full_name})")
            
            # Create reputation for business
            reputation, rep_created = Reputation.objects.get_or_create(
                business=business,
                defaults={
                    'share_count': 0,
                    'average_ratting': 0.0,
                    'review_count': 0,
                    'click_count': 0,
                    'view_count': 0,
                    'search_count': 0
                }
            )
            if rep_created:
                print(f"  ✓ Created reputation for: {business.name}")
        else:
            print(f"✓ Business exists: {business.name}")
        
        businesses.append(business)
    
    return businesses

def create_ads(businesses, users, count=15):
    """Create multiple test ads"""
    print(f"\n{'='*60}")
    print(f"Creating {count} Ads...")
    print(f"{'='*60}")

    ad_titles = [
        "Premium Web Development Services",
        "Professional Graphic Design",
        "Digital Marketing Solutions",
        "Mobile App Development",
        "SEO Optimization Services",
        "Social Media Management",
        "Cloud Hosting Solutions",
        "E-commerce Development",
        "Brand Identity Design",
        "Content Writing Services",
        "Video Production",
        "UI/UX Design",
        "Database Management",
        "Cybersecurity Solutions",
        "AI & Machine Learning"
    ]

    descriptions = [
        "Transform your business with our cutting-edge solutions",
        "Professional services tailored to your needs",
        "Expert team with years of experience",
        "Affordable pricing with premium quality",
        "24/7 support and maintenance included"
    ]

    ads = []
    for i in range(count):
        business = businesses[i % len(businesses)]
        owner = users[i % len(users)]
        title = ad_titles[i % len(ad_titles)]

        ad, created = Ad.objects.get_or_create(
            title=title,
            business=business,
            owner=owner,
            defaults={
                'description': descriptions[i % len(descriptions)],
                'status': random.choice(['draft', 'active', 'active', 'active']),  # More active ads
                'share_count': 0
            }
        )
        
        if created:
            print(f"✓ Created ad: {ad.title} (Business: {business.name})")
        else:
            print(f"✓ Ad exists: {ad.title}")
        
        ads.append(ad)
    
    return ads

def create_interactions(users, ads, businesses):
    """Create realistic interaction data"""
    print(f"\n{'='*60}")
    print(f"Creating Interactions...")
    print(f"{'='*60}")
    
    # Create ad clicks
    click_count = 0
    for ad in ads:
        num_clicks = random.randint(5, 50)
        for _ in range(num_clicks):
            user = random.choice(users) if random.random() > 0.3 else None
            click, created = AdClick.objects.get_or_create(
                ad=ad,
                user=user,
                session_id=f'session-{random.randint(1000, 9999)}',
                defaults={
                    'ip_address': f'192.168.{random.randint(1, 255)}.{random.randint(1, 255)}',
                    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'referrer': random.choice(['https://google.com', 'https://facebook.com', 'direct', ''])
                }
            )
            if created:
                click_count += 1
    
    print(f"✓ Created {click_count} ad clicks")
    
    # Create ad views
    view_count = 0
    for ad in ads:
        num_views = random.randint(10, 100)
        for _ in range(num_views):
            user = random.choice(users) if random.random() > 0.5 else None
            view, created = AdView.objects.get_or_create(
                ad=ad,
                user=user,
                session_id=f'session-{random.randint(1000, 9999)}',
                defaults={
                    'ip_address': f'192.168.{random.randint(1, 255)}.{random.randint(1, 255)}'
                }
            )
            if created:
                view_count += 1
    
    print(f"✓ Created {view_count} ad views")
    
    # Create search queries
    search_queries = [
        "web development",
        "graphic design",
        "digital marketing",
        "mobile app",
        "SEO services",
        "social media",
        "cloud hosting",
        "e-commerce"
    ]
    
    search_count = 0
    for _ in range(30):
        query = random.choice(search_queries)
        user = random.choice(users) if random.random() > 0.4 else None
        clicked_ad = random.choice(ads) if random.random() > 0.5 else None
        
        search, created = SearchQuery.objects.get_or_create(
            query=query,
            user=user,
            session_id=f'session-{random.randint(1000, 9999)}',
            defaults={
                'results_count': random.randint(1, 20),
                'clicked_ad': clicked_ad
            }
        )
        if created:
            search_count += 1
    
    print(f"✓ Created {search_count} search queries")
    
    # Create shares
    share_count = 0
    for ad in ads:
        num_shares = random.randint(1, 10)
        for _ in range(num_shares):
            user = random.choice(users) if random.random() > 0.3 else None
            share = Share.objects.create(
                ad=ad,
                user=user
            )
            share_count += 1

    print(f"✓ Created {share_count} shares")
    
    # Create reviews (reviews are for ads, not businesses)
    review_count = 0
    for ad in ads:
        num_reviews = random.randint(1, 5)
        for _ in range(num_reviews):
            user = random.choice(users)
            review = Review.objects.create(
                ad=ad,
                user=user,
                content=f'Great service! Highly recommended. Very professional work.'
            )
            review_count += 1

    print(f"✓ Created {review_count} reviews")
    
    # Create service ratings (ratings are for ads, not businesses)
    rating_count = 0
    for ad in ads:
        num_ratings = random.randint(3, 10)
        for _ in range(num_ratings):
            user = random.choice(users)
            rating = ServiceRatting.objects.create(
                ad=ad,
                user=user,
                ratting=random.randint(3, 5)  # Note: field is 'ratting' not 'rating'
            )
            rating_count += 1

    print(f"✓ Created {rating_count} service ratings")

def update_reputations(businesses):
    """Update reputation scores for all businesses"""
    print(f"\n{'='*60}")
    print(f"Updating Reputation Scores...")
    print(f"{'='*60}")

    for business in businesses:
        try:
            reputation = Reputation.objects.get(business=business)
            reputation.update_from_business(business)
            print(f"✓ Updated reputation for {business.name}:")
            print(f"  - Clicks: {reputation.click_count}")
            print(f"  - Views: {reputation.view_count}")
            print(f"  - Shares: {reputation.share_count}")
            print(f"  - Reviews: {reputation.review_count}")
            print(f"  - Avg Rating: {reputation.average_ratting}")
            print(f"  - Score: {reputation.calculate_score():.2f}")
        except Reputation.DoesNotExist:
            print(f"✗ No reputation found for {business.name}")

def main():
    print("\n" + "="*60)
    print("AdVouch Sample Data Generator")
    print("="*60)
    
    # Create data
    users = create_users(10)
    businesses = create_businesses(users, 5)
    ads = create_ads(businesses, users, 15)
    create_interactions(users, ads, businesses)
    update_reputations(businesses)
    
    # Print summary
    print(f"\n{'='*60}")
    print("Summary")
    print(f"{'='*60}")
    print(f"✓ Users: {User.objects.count()}")
    print(f"✓ Businesses: {Business.objects.count()}")
    print(f"✓ Ads: {Ad.objects.count()}")
    print(f"✓ Ad Clicks: {AdClick.objects.count()}")
    print(f"✓ Ad Views: {AdView.objects.count()}")
    print(f"✓ Search Queries: {SearchQuery.objects.count()}")
    print(f"✓ Shares: {Share.objects.count()}")
    print(f"✓ Reviews: {Review.objects.count()}")
    print(f"✓ Service Ratings: {ServiceRatting.objects.count()}")
    print(f"✓ Reputations: {Reputation.objects.count()}")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()

