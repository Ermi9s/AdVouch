#!/usr/bin/env python
"""
Test script to create sample data and test API endpoints
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'advouch.settings')
django.setup()

from django.contrib.auth import get_user_model
from ads.models import Ad
from business.models import Business
from interactions.models import AdClick, AdView, SearchQuery
from reputation.models import Reputation

User = get_user_model()

def create_sample_data():
    """Create sample users, businesses, and ads"""
    print("Creating sample data...")

    # Create test user (using custom User model)
    user, created = User.objects.get_or_create(
        phone_number='+1234567890',
        defaults={
            'email': 'test@example.com',
            'full_name': 'Test User'
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"✓ Created user: {user.full_name}")
    else:
        print(f"✓ User already exists: {user.full_name}")
    
    # Create test business
    business, created = Business.objects.get_or_create(
        name='Test Business',
        defaults={
            'location': 'Test City',
            'description': 'A test business for API testing',
            'owner': user
        }
    )
    if created:
        print(f"✓ Created business: {business.name}")
    else:
        print(f"✓ Business already exists: {business.name}")
    
    # Create reputation for business
    reputation, created = Reputation.objects.get_or_create(
        business=business,
        defaults={
            'share_count': 0,
            'average_ratting': 0.0,
            'review_count': 0,
            'click_count': 0,
            'view_count': 0,
            'search_count': 0,
            'overall_score': 0.0
        }
    )
    if created:
        print(f"✓ Created reputation for business: {business.name}")
    else:
        print(f"✓ Reputation already exists for business: {business.name}")
    
    # Create test ads
    ad_titles = [
        'Premium Web Development Services',
        'Professional Graphic Design',
        'Digital Marketing Solutions'
    ]
    
    ads = []
    for title in ad_titles:
        ad, created = Ad.objects.get_or_create(
            title=title,
            defaults={
                'description': f'High-quality {title.lower()} for your business needs',
                'business': business,
                'owner': user,
                'status': 'active'
            }
        )
        ads.append(ad)
        if created:
            print(f"✓ Created ad: {ad.title}")
        else:
            print(f"✓ Ad already exists: {ad.title}")
    
    return user, business, ads

def test_tracking_endpoints():
    """Test interaction tracking endpoints"""
    print("\n" + "="*60)
    print("Testing Interaction Tracking Endpoints")
    print("="*60)
    
    user, business, ads = create_sample_data()
    
    if not ads:
        print("✗ No ads available for testing")
        return
    
    test_ad = ads[0]
    print(f"\nUsing test ad: {test_ad.title} (ID: {test_ad.id})")
    
    # Test 1: Track ad click
    print("\n1. Testing Ad Click Tracking...")
    click = AdClick.objects.create(
        ad=test_ad,
        user=user,
        session_id='test-session-123',
        ip_address='127.0.0.1',
        referrer='https://example.com',
        user_agent='Mozilla/5.0 Test Browser'
    )
    print(f"✓ Created ad click: ID {click.id}")
    print(f"  - Ad: {click.ad.title}")
    print(f"  - User: {click.user.full_name if click.user else 'Anonymous'}")
    print(f"  - Session: {click.session_id}")
    print(f"  - IP: {click.ip_address}")

    # Test 2: Track ad view
    print("\n2. Testing Ad View Tracking...")
    view = AdView.objects.create(
        ad=test_ad,
        user=user,
        session_id='test-session-123',
        ip_address='127.0.0.1'
    )
    print(f"✓ Created ad view: ID {view.id}")
    print(f"  - Ad: {view.ad.title}")
    print(f"  - User: {view.user.full_name if view.user else 'Anonymous'}")
    
    # Test 3: Track search query
    print("\n3. Testing Search Query Tracking...")
    search = SearchQuery.objects.create(
        query='web development',
        user=user,
        session_id='test-session-123',
        results_count=3,
        clicked_ad=test_ad
    )
    print(f"✓ Created search query: ID {search.id}")
    print(f"  - Query: {search.query}")
    print(f"  - Results: {search.results_count}")
    print(f"  - Clicked Ad: {search.clicked_ad.title if search.clicked_ad else 'None'}")
    
    # Test 4: Check reputation update
    print("\n4. Testing Reputation Calculation...")
    reputation = Reputation.objects.get(business=business)
    
    # Update counts
    reputation.click_count = AdClick.objects.filter(ad__business=business).count()
    reputation.view_count = AdView.objects.filter(ad__business=business).count()
    reputation.search_count = SearchQuery.objects.filter(clicked_ad__business=business).count()
    
    # Calculate score
    old_score = reputation.overall_score
    reputation.calculate_score()
    reputation.save()
    
    print(f"✓ Updated reputation for business: {business.name}")
    print(f"  - Clicks: {reputation.click_count}")
    print(f"  - Views: {reputation.view_count}")
    print(f"  - Searches: {reputation.search_count}")
    print(f"  - Overall Score: {old_score:.2f} → {reputation.overall_score:.2f}")
    
    # Test 5: Query statistics
    print("\n5. Database Statistics...")
    total_clicks = AdClick.objects.count()
    total_views = AdView.objects.count()
    total_searches = SearchQuery.objects.count()
    
    print(f"✓ Total ad clicks: {total_clicks}")
    print(f"✓ Total ad views: {total_views}")
    print(f"✓ Total search queries: {total_searches}")
    
    print("\n" + "="*60)
    print("All tests completed successfully!")
    print("="*60)

if __name__ == '__main__':
    try:
        test_tracking_endpoints()
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

