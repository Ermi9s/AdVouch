#!/usr/bin/env python
"""
Performance testing script for AdVouch API endpoints
Tests response times, database performance, and load handling
"""
import os
import sys
import django
import time
import statistics
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'advouch.settings')
django.setup()

from django.db import connection
from django.test.utils import CaptureQueriesContext
from users.models import User
from business.models import Business
from ads.models import Ad
from interactions.models import AdClick, AdView, SearchQuery, Share
from reputation.models import Reputation

def measure_time(func):
    """Decorator to measure function execution time"""
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        return result, (end - start) * 1000  # Return result and time in ms
    return wrapper

def print_header(title):
    """Print formatted header"""
    print(f"\n{'='*70}")
    print(f"{title:^70}")
    print(f"{'='*70}\n")

def print_metric(name, value, unit="ms", threshold=None):
    """Print formatted metric with optional threshold check"""
    status = ""
    if threshold:
        if value <= threshold:
            status = " ✓"
        else:
            status = f" ✗ (threshold: {threshold}{unit})"
    
    print(f"  {name:.<50} {value:.2f}{unit}{status}")

@measure_time
def test_user_query():
    """Test user query performance"""
    return list(User.objects.all()[:100])

@measure_time
def test_business_query():
    """Test business query performance"""
    return list(Business.objects.select_related('owner').all()[:100])

@measure_time
def test_ad_query():
    """Test ad query performance"""
    return list(Ad.objects.select_related('business', 'owner').all()[:100])

@measure_time
def test_ad_with_media():
    """Test ad query with media files"""
    return list(Ad.objects.prefetch_related('media_files').all()[:100])

@measure_time
def test_click_query():
    """Test ad click query performance"""
    return list(AdClick.objects.select_related('ad', 'user').all()[:100])

@measure_time
def test_view_query():
    """Test ad view query performance"""
    return list(AdView.objects.select_related('ad', 'user').all()[:100])

@measure_time
def test_search_query():
    """Test search query performance"""
    return list(SearchQuery.objects.select_related('user', 'clicked_ad', 'clicked_business').all()[:100])

@measure_time
def test_reputation_query():
    """Test reputation query performance"""
    return list(Reputation.objects.select_related('business').all())

@measure_time
def test_reputation_calculation():
    """Test reputation score calculation"""
    reputations = Reputation.objects.all()[:10]
    for rep in reputations:
        rep.calculate_score()
    return reputations

@measure_time
def test_create_ad_click():
    """Test creating ad click"""
    ad = Ad.objects.first()
    if ad:
        return AdClick.objects.create(
            ad=ad,
            session_id=f'perf-test-{time.time()}',
            ip_address='127.0.0.1'
        )
    return None

@measure_time
def test_create_ad_view():
    """Test creating ad view"""
    ad = Ad.objects.first()
    if ad:
        return AdView.objects.create(
            ad=ad,
            session_id=f'perf-test-{time.time()}',
            ip_address='127.0.0.1'
        )
    return None

@measure_time
def test_bulk_create_clicks():
    """Test bulk creating ad clicks"""
    ad = Ad.objects.first()
    if ad:
        clicks = [
            AdClick(
                ad=ad,
                session_id=f'bulk-test-{i}',
                ip_address='127.0.0.1'
            )
            for i in range(100)
        ]
        return AdClick.objects.bulk_create(clicks)
    return []

def test_database_stats():
    """Get database statistics"""
    print_header("Database Statistics")
    
    stats = {
        "Users": User.objects.count(),
        "Businesses": Business.objects.count(),
        "Ads": Ad.objects.count(),
        "Ad Clicks": AdClick.objects.count(),
        "Ad Views": AdView.objects.count(),
        "Search Queries": SearchQuery.objects.count(),
        "Shares": Share.objects.count(),
        "Reputations": Reputation.objects.count(),
    }
    
    for name, count in stats.items():
        print(f"  {name:.<50} {count:,}")
    
    return stats

def test_query_performance():
    """Test query performance"""
    print_header("Query Performance Tests")
    
    tests = [
        ("User Query (100 records)", test_user_query, 50),
        ("Business Query with Owner (100 records)", test_business_query, 100),
        ("Ad Query with Relations (100 records)", test_ad_query, 100),
        ("Ad Query with Media (100 records)", test_ad_with_media, 150),
        ("Ad Click Query (100 records)", test_click_query, 100),
        ("Ad View Query (100 records)", test_view_query, 100),
        ("Search Query (100 records)", test_search_query, 100),
        ("Reputation Query (all records)", test_reputation_query, 50),
    ]
    
    results = []
    for name, test_func, threshold in tests:
        _, exec_time = test_func()
        print_metric(name, exec_time, threshold=threshold)
        results.append((name, exec_time))
    
    return results

def test_write_performance():
    """Test write performance"""
    print_header("Write Performance Tests")
    
    tests = [
        ("Create Ad Click", test_create_ad_click, 20),
        ("Create Ad View", test_create_ad_view, 20),
        ("Bulk Create 100 Clicks", test_bulk_create_clicks, 100),
    ]
    
    results = []
    for name, test_func, threshold in tests:
        _, exec_time = test_func()
        print_metric(name, exec_time, threshold=threshold)
        results.append((name, exec_time))
    
    return results

def test_calculation_performance():
    """Test calculation performance"""
    print_header("Calculation Performance Tests")
    
    tests = [
        ("Reputation Score Calculation (10 records)", test_reputation_calculation, 100),
    ]
    
    results = []
    for name, test_func, threshold in tests:
        _, exec_time = test_func()
        print_metric(name, exec_time, threshold=threshold)
        results.append((name, exec_time))
    
    return results

def test_query_count():
    """Test number of queries executed"""
    print_header("Query Count Analysis")
    
    # Test 1: Fetch ads with relations
    with CaptureQueriesContext(connection) as context:
        ads = list(Ad.objects.select_related('business', 'owner').all()[:10])
    print(f"  Ads with select_related (10 records): {len(context.captured_queries)} queries")
    
    # Test 2: Fetch ads without optimization
    with CaptureQueriesContext(connection) as context:
        ads = list(Ad.objects.all()[:10])
        for ad in ads:
            _ = ad.business.name
            _ = ad.owner.full_name if ad.owner else None
    print(f"  Ads without optimization (10 records): {len(context.captured_queries)} queries (N+1 problem)")
    
    # Test 3: Fetch reputation with business
    with CaptureQueriesContext(connection) as context:
        reps = list(Reputation.objects.select_related('business').all()[:10])
    print(f"  Reputation with select_related (10 records): {len(context.captured_queries)} queries")

def run_stress_test(iterations=10):
    """Run stress test with multiple iterations"""
    print_header(f"Stress Test ({iterations} iterations)")
    
    times = []
    for i in range(iterations):
        start = time.time()
        
        # Simulate typical user workflow
        ads = list(Ad.objects.all()[:20])
        ad = ads[0] if ads else None
        
        if ad:
            # Track view
            AdView.objects.create(
                ad=ad,
                session_id=f'stress-test-{i}',
                ip_address='127.0.0.1'
            )
            
            # Track click
            AdClick.objects.create(
                ad=ad,
                session_id=f'stress-test-{i}',
                ip_address='127.0.0.1'
            )
        
        end = time.time()
        times.append((end - start) * 1000)
    
    avg_time = statistics.mean(times)
    min_time = min(times)
    max_time = max(times)
    median_time = statistics.median(times)
    
    print(f"  Average time: {avg_time:.2f}ms")
    print(f"  Minimum time: {min_time:.2f}ms")
    print(f"  Maximum time: {max_time:.2f}ms")
    print(f"  Median time: {median_time:.2f}ms")
    
    if avg_time < 100:
        print(f"  Status: ✓ Excellent performance")
    elif avg_time < 200:
        print(f"  Status: ✓ Good performance")
    elif avg_time < 500:
        print(f"  Status: ⚠ Acceptable performance")
    else:
        print(f"  Status: ✗ Poor performance - optimization needed")

def main():
    print("\n" + "="*70)
    print("AdVouch Performance Testing Suite")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    # Run all tests
    db_stats = test_database_stats()
    query_results = test_query_performance()
    write_results = test_write_performance()
    calc_results = test_calculation_performance()
    test_query_count()
    run_stress_test(10)
    
    # Summary
    print_header("Performance Summary")
    
    all_results = query_results + write_results + calc_results
    avg_time = statistics.mean([t for _, t in all_results])
    
    print(f"  Total tests run: {len(all_results)}")
    print(f"  Average execution time: {avg_time:.2f}ms")
    print(f"  Total database records: {sum(db_stats.values()):,}")
    
    # Performance rating
    if avg_time < 50:
        rating = "Excellent ⭐⭐⭐⭐⭐"
    elif avg_time < 100:
        rating = "Good ⭐⭐⭐⭐"
    elif avg_time < 200:
        rating = "Acceptable ⭐⭐⭐"
    else:
        rating = "Needs Optimization ⭐⭐"
    
    print(f"\n  Overall Performance Rating: {rating}")
    
    print("\n" + "="*70)
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70 + "\n")

if __name__ == '__main__':
    main()

