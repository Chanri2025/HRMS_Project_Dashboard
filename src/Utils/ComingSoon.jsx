import React from "react";
import {useNavigate} from "react-router-dom";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {BarChart3, ArrowLeft} from "lucide-react";

const ComingSoonPage = ({
                            title = "Reports Module Coming Soon",
                            message = "This module is under development. Stay tuned for detailed analytics & insights.",
                            menuPath = "/dashboard",          // change if your main menu route is different
                            menuLabel = "Go to Menu",
                        }) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)] px-4">
            <Card className="w-full max-w-2xl rounded-3xl border border-border bg-muted px-20 py-20 shadow-sm">
                {/* Icon */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-primary"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">
                                {title}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Menu Button */}
                <div className="mt-8 flex justify-center">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate(menuPath)}
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        {menuLabel}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ComingSoonPage;
