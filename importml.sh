#!/bin/bash

if [ $1 = "--reverse" ]; then
	MLDIR=$2
else
	MLDIR=$1
fi

JSDIR=$MLDIR/lib
CSSDIR=$MLDIR/css
IMGDIR=$MLDIR/img

if [ $1 = "--reverse" ]; then
	cp js/multilightbox/* $JSDIR
	cp css/multilightbox.css $CSSDIR
	cp img/close.svg img/fullscreen.svg img/defullscreen.svg $IMGDIR
	cp js/multilightbox/hooks.txt $MLDIR
else
	cp $JSDIR/* js/multilightbox/
	cp $CSSDIR/* css/
	cp $IMGDIR/* img/
	cp $MLDIR/hooks.txt js/multilightbox/
fi
