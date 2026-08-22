import { Award, CheckCircle, GraduationCap, Search, Shield, Sparkles, Target, Users, Zap } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";
import { Footer } from "../components/layout/Footer";

function LandingPage(){
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/find-tutors?search=${encodeURIComponent(searchQuery)}`;
        }
    };
    return(
    <>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl hidden sm:inline-block">
                    AcademiConnect
                </span>
                </Link>
                {/* Search Bar - Desktop */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                    type="text"
                    placeholder="Search for tutors or subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                </form>
                <div className="flex items-center gap-2">
                <Link to="/login">
                    <Button variant="secondary">Login</Button>
                </Link>
                <Link to="/register">
                    <Button>Sign Up</Button>
                </Link>
                </div>
            </div>
    </header>
        <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="w-4 h-4 mr-1" />
              AI-Powered Matching
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Master your courses with{' '}
              <span className="text-blue-600">peer-to-peer learning.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              The ultimate academic marketplace for university students. 
              Connect with top-tier tutors from known universities.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-2 max-w-3xl mx-auto mb-8">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder='Try "Discrete Math for LAU" or "Organic Chemistry USJ"...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 border-0 focus-visible:ring-0 text-base"
                  />
                </div>
                
                <Button type="submit" className="px-8 py-3 bg-blue-500 hover:bg-blue-600">
                  <Search className="w-5 h-5 mr-2" />
                  Find Tutor
                </Button>
              </form>
            </div>

            {/* Trust Badges */}
            <p className="text-sm text-gray-500">
              Trusted by students from{' '}
              <span className="font-medium text-gray-700">AUB</span>,{' '}
              <span className="font-medium text-gray-700">LAU</span>,{' '}
              <span className="font-medium text-gray-700">USJ</span>,{' '}
              <span className="font-medium text-gray-700">BAU</span>,{' '}
              <span className="font-medium text-gray-700">NDU</span>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to academic excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-blue-600 mb-2">STEP 1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Search & Filter</h3>
                <p className="text-gray-600">
                  Use our AI-driven search to find tutors by subject, university, price, availability, and ratings.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-7 h-7 text-green-600" />
                </div>
                <div className="text-sm font-semibold text-green-600 mb-2">STEP 2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Smart Match</h3>
                <p className="text-gray-600">
                  Our algorithm matches your learning style and course needs with tutors who've already aced your course.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-7 h-7 text-purple-600" />
                </div>
                <div className="text-sm font-semibold text-purple-600 mb-2">STEP 3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Ace Your Exams</h3>
                <p className="text-gray-600">
                  Book a session, get personalized insights, and join thousands of students who have improved their GPA.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Rated Tutors Section
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Top Rated Tutors
              </h2>
              <p className="text-gray-600">
                Verified peers from Lebanon's leading universities
              </p>
            </div>
            <Link href="/find-tutors">
              <Button variant="ghost" className="mt-4 sm:mt-0 text-blue-600">
                View all tutors
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tutors.map((tutor) => (
                <Link key={tutor.id} href={`/tutors/${tutor.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={tutor.user.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-lg font-semibold">
                            {getInitials(tutor.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          {tutor.rating.toFixed(1)}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {tutor.user.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-1 line-clamp-1">
                        {tutor.title || 'Peer Tutor'}
                      </p>
                      
                      <p className="text-xs text-gray-500 mb-3">
                        {tutor.user.university || 'Lebanese University'}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {(Array.isArray(tutor.subjects) ? tutor.subjects : []).slice(0, 2).map((subject: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {(Array.isArray(tutor.subjects) ? tutor.subjects : []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(Array.isArray(tutor.subjects) ? tutor.subjects : []).length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-xl font-bold text-gray-900">${tutor.hourlyRate}</span>
                          <span className="text-sm text-gray-500">/hr</span>
                        </div>
                        <Button size="sm" variant="outline" className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section> */}

      {/* Built for Lebanese Academic Landscape Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">AI-POWERED</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built for the Lebanese Academic Landscape.
              </h2>
              
              <p className="text-lg text-gray-600 mb-8">
                Our AI doesn't just look for generic subjects. It understands the nuances of 
                <strong> AUB's MECH 300 vs LAU's GNE 212</strong>. We prioritize peer matches 
                from your own university because they know the professors, the exam formats, and 
                the exact material your course covers.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Course-Specific Matching</h4>
                    <p className="text-sm text-gray-600">Targeted help for matching course codes in your major.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Professor Insights</h4>
                    <p className="text-sm text-gray-600">Learn from students who have already passed your specific professor's class.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8 relative">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">MATCHING ENGINE ACTIVE</p>
                      <p className="text-xs text-gray-500">Finding your perfect match...</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {/* <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-green-100 text-green-600 text-xs">RS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Rami S.</p>
                        <p className="text-xs text-gray-500">Expert in Heat Transfer</p>
                      </div> */}
                      <Badge className="bg-green-100 text-green-700 text-xs">98% Match</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                      {/* <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">DK</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Dana K.</p>
                        <p className="text-xs text-gray-500">Fluid Dynamics Specialist</p>
                      </div> */}
                      <Badge variant="outline" className="text-xs">94% Match</Badge>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 font-medium">98% MATCH</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-200 rounded-full blur-2xl opacity-60"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full blur-2xl opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Join the network of academic success.
            </h2>
            <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
              Over 5,000 Lebanese students are already using AcademiConnect to excel in their courses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register">
                <Button variant="secondary" className="px-8 py-4 text-base">
                  Get Started Now
                </Button>
              </Link>
              <Link to="/become-tutor">
                <Button variant="secondary" className="px-8 py-4 text-base border-white text-white hover:bg-white/10">
                  Become a Tutor
                </Button>
              </Link>
            </div>

            <div className="flex justify-center gap-12 text-white">
              <div className="text-center">
                <div className="text-4xl font-bold">5k+</div>
                <div className="text-blue-200 text-sm">Students</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">12k+</div>
                <div className="text-blue-200 text-sm">Sessions</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer />
        </>
    );
}
export default LandingPage;
